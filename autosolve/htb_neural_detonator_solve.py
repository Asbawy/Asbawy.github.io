#!/usr/bin/env python3
"""Neural Detonator — automated solver.
Extracts the hidden payload + flag from mlcious.keras without TensorFlow:
  1. unzip .keras -> config.json + model.weights.h5
  2. decode the Lambda layer's base64+marshal trampoline
  3. derive seed = uint32(sha1(seed_dense/kernel ++ seed_dense/bias)[:4])
  4. key = random.Random(seed).randbytes(32)
  5. XOR embedded blob -> marshal.loads -> stage-2 payload
  6. payload: enc = uint8(payload_dense/bias[:22] * 255); flag = enc ^ key
"""
import sys, os, json, base64, marshal, struct, hashlib, random, zipfile, tempfile
from pathlib import Path

def find_keras(start):
    """locate the .keras file: explicit path, cwd, script dir, or recursive"""
    if len(sys.argv) > 1 and Path(sys.argv[1]).exists():
        return Path(sys.argv[1])
    for base in (Path.cwd(), Path(__file__).resolve().parent):
        for p in base.rglob("*.keras"):
            return p
    return None

def main():
    keras_path = find_keras(start=Path.cwd())
    if keras_path is None:
        sys.exit("[!] mlcious.keras not found (pass path as argv[1])")
    print(f"[*] Challenge file: {keras_path}")

    work = Path(tempfile.mkdtemp(prefix="mlx_"))
    with zipfile.ZipFile(keras_path) as z:
        z.extractall(work)
    print(f"[*] Extracted .keras archive to {work}")

    #  weights 
    import h5py
    h5 = h5py.File(work / "model.weights.h5", "r")
    # H5 paths are positional (layers/dense, layers/dense_1, ...) while
    # config.json holds the real layer names — map by Dense-layer order.
    cfg = json.load(open(work / "config.json"))
    dense_layers = [l for l in cfg["config"]["layers"] if l.get("class_name") == "Dense"]
    def h5_path_for(config_name):
        idx = next(i for i, l in enumerate(dense_layers)
                   if l["config"]["name"] == config_name)
        return f"layers/dense{('_' + str(idx)) if idx else ''}"
    seed_kernel = h5[h5_path_for("seed_dense") + "/vars/0"][:]
    seed_bias   = h5[h5_path_for("seed_dense") + "/vars/1"][:]
    pay_bias    = h5[h5_path_for("payload_dense") + "/vars/1"][:]
    print(f"[*] seed_dense/kernel: {seed_kernel.shape}, bias: {seed_bias.shape}, "
          f"payload_dense/bias: {pay_bias.shape}")

    #  Lambda trampoline 
    cfg = json.load(open(work / "config.json"))
    lambda_fn = None
    for layer in cfg["config"]["layers"]:
        if layer.get("class_name") == "Lambda":
            lambda_fn = layer["config"]["function"]
    code = marshal.loads(base64.b64decode(lambda_fn[0]))
    tramp = next(c for c in code.co_consts
                 if hasattr(c, "co_name") and c.co_name == "trampoline")
    blob = next(c for c in tramp.co_consts if isinstance(c, tuple))
    print(f"[*] Trampoline: {len(blob)}-byte encrypted stage-2 payload")

    #  derive key 
    digest = hashlib.sha1(seed_kernel.tobytes() + seed_bias.tobytes()).digest()
    seed = struct.unpack("<I", digest[:4])[0]
    key = random.Random(seed).randbytes(32)
    print(f"[+] seed = 0x{seed:08x}")
    print(f"[+] key  = {list(key)}")

    #  decrypt stage-2 payload 
    payload_code = bytes(c ^ key[i % 32] for i, c in enumerate(blob))
    payload_mod = marshal.loads(payload_code)
    payload_fn = next(c for c in payload_mod.co_consts if hasattr(c, "co_name"))
    print(f"[*] Stage-2 payload function '{payload_fn.co_name}' decrypted "
          f"({len(payload_code)} bytes)")

    #  ciphertext from payload_dense bias 
    enc = (pay_bias[:22] * 255).astype("uint8").tobytes()
    print(f"[*] Ciphertext bytes: {list(enc)}")

    #  decrypt flag 
    flag = bytes(c ^ key[i % 32] for i, c in enumerate(enc))
    print(f"[+] FLAG: {flag.decode()}")

if __name__ == "__main__":
    main()
