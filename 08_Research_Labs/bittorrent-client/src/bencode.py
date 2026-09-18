"""
bencode.py — Encoder/Decoder for the Bencode format used in .torrent files.
Spec: https://wiki.theory.org/BitTorrentSpecification#Bencoding
"""


def decode(data: bytes, idx: int = 0):
    """Decode bencoded bytes, return (value, next_index)."""
    if idx >= len(data):
        raise ValueError("Unexpected end of data")

    ch = chr(data[idx])

    # Integer: i<digits>e
    if ch == 'i':
        end = data.index(b'e', idx)
        return int(data[idx + 1:end]), end + 1

    # List: l<items>e
    if ch == 'l':
        result = []
        idx += 1
        while data[idx:idx + 1] != b'e':
            val, idx = decode(data, idx)
            result.append(val)
        return result, idx + 1

    # Dict: d<key><value>...e
    if ch == 'd':
        result = {}
        idx += 1
        while data[idx:idx + 1] != b'e':
            key, idx = decode(data, idx)
            val, idx = decode(data, idx)
            result[key] = val
        return result, idx + 1

    # String: <length>:<bytes>
    if ch.isdigit():
        colon = data.index(b':', idx)
        length = int(data[idx:colon])
        start = colon + 1
        return data[start:start + length], start + length

    raise ValueError(f"Unknown bencode token '{ch}' at position {idx}")


def loads(data: bytes):
    """Decode bencoded bytes into a Python object."""
    val, _ = decode(data, 0)
    return val


def encode(obj) -> bytes:
    """Encode a Python object into bencode bytes."""
    if isinstance(obj, int):
        return b'i' + str(obj).encode() + b'e'

    if isinstance(obj, bytes):
        return str(len(obj)).encode() + b':' + obj

    if isinstance(obj, str):
        encoded = obj.encode('utf-8')
        return str(len(encoded)).encode() + b':' + encoded

    if isinstance(obj, list):
        return b'l' + b''.join(encode(i) for i in obj) + b'e'

    if isinstance(obj, dict):
        # Keys must be sorted for canonical form
        items = sorted(obj.items(), key=lambda kv: kv[0] if isinstance(kv[0], bytes) else kv[0].encode())
        return b'd' + b''.join(encode(k) + encode(v) for k, v in items) + b'e'

    raise TypeError(f"Cannot bencode type {type(obj)}")
