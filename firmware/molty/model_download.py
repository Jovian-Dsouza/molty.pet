"""Download LiveKit's Apache-licensed temporary "hey livekit" test model."""

from __future__ import annotations

import argparse
import hashlib
import urllib.request
from pathlib import Path

MODEL_URL = (
    "https://raw.githubusercontent.com/livekit-examples/hello-wakeword/"
    "d9a6c14bf86f822e31854f3c2df5012ff4d5dd8e/client/models/hey_livekit.onnx"
)
MODEL_SHA256 = "8bd634fb7acf1e52d06307fb8f460abf2c7a40e561fb4532fc56e087e0246f62"


def download(output: Path) -> Path:
    output = output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix(f"{output.suffix}.part")
    try:
        with urllib.request.urlopen(MODEL_URL, timeout=30) as response:
            data = response.read()
        digest = hashlib.sha256(data).hexdigest()
        if digest != MODEL_SHA256:
            raise RuntimeError(
                f"wake model checksum mismatch: expected {MODEL_SHA256}, got {digest}"
            )
        temporary.write_bytes(data)
        temporary.replace(output)
    finally:
        temporary.unlink(missing_ok=True)
    return output


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "output",
        nargs="?",
        type=Path,
        default=Path("models/hey_livekit.onnx"),
    )
    args = parser.parse_args()
    path = download(args.output)
    print(f"Downloaded test wake model to {path}")
    print('This model listens for "hey livekit", not "hey molty".')
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
