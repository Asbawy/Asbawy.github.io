#!/usr/bin/env python3
"""Ghostlink hive inspector - dump interesting keys from ntuser.dat."""
import sys
from Registry import Registry


def main(path):
    reg = Registry.Registry(path)
    root = reg.root()

    targets = [
        r"Software\Microsoft\Windows\CurrentVersion\Explorer\RecentDocs",
        r"Software\Microsoft\Windows\CurrentVersion\Explorer\ComDlg32\OpenSavePidlMRU",
        r"Software\Microsoft\Windows\CurrentVersion\Explorer\TypedPaths",
        r"Software\Microsoft\Windows\CurrentVersion\Explorer\RunMRU",
    ]
    for t in targets:
        print("\n" + "=" * 70)
        print("KEY:", t)
        print("=" * 70)
        try:
            k = root.find_key(t)
        except Exception:
            print("  (not found)")
            continue
        try:
            for v in k.values():
                name = v.name()
                raw = v.raw_data()
                vt = v.value_type_str()
                if vt in ("RegSZ", "RegExpandSZ"):
                    print(f"  [{vt}] {name} = {v.value()}")
                elif vt == "RegBin":
                    try:
                        s = raw.decode("utf-16-le", errors="replace").replace("\x00", "")
                        print(f"  [RegBin] {name} (utf16) = {s!r}")
                    except Exception:
                        print(f"  [RegBin] {name} = {len(raw)} bytes")
                else:
                    print(f"  [{vt}] {name} = {len(raw)} bytes")
        except Exception as e:
            print("  err:", e)
        try:
            for sub in k.subkeys():
                print(f"  SUBKEY: {sub.name()}")
        except Exception:
            pass


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "loot/ntuser.dat")
