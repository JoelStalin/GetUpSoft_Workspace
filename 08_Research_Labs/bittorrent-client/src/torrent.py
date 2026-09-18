"""
torrent.py — Parse .torrent files and expose metadata.
Handles both single-file and multi-file torrents.
"""

import hashlib
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional
from .bencode import loads


@dataclass
class TorrentFile:
    path: str
    length: int


@dataclass
class Torrent:
    name: str
    info_hash: bytes          # 20-byte SHA1 of bencoded info dict
    piece_length: int         # bytes per piece
    pieces: List[bytes]       # list of 20-byte SHA1 hashes, one per piece
    files: List[TorrentFile]  # one entry even for single-file torrents
    announce: str             # primary tracker URL
    announce_list: List[str]  # all tracker URLs (flattened)
    total_length: int         # sum of all file sizes
    comment: str = ""
    created_by: str = ""

    @property
    def piece_count(self) -> int:
        return len(self.pieces)

    @property
    def is_multi_file(self) -> bool:
        return len(self.files) > 1

    def piece_size(self, index: int) -> int:
        """Return actual size of piece (last piece may be smaller)."""
        if index == self.piece_count - 1:
            remainder = self.total_length % self.piece_length
            return remainder if remainder else self.piece_length
        return self.piece_length


def _decode_str(val) -> str:
    if isinstance(val, bytes):
        return val.decode('utf-8', errors='replace')
    return str(val)


def load(path: str | Path) -> Torrent:
    """Load and parse a .torrent file."""
    data = Path(path).read_bytes()
    meta = loads(data)

    # --- Info hash ---
    # Re-encode just the info dict to compute the hash
    from .bencode import encode as bencode_encode
    info_dict_raw = _extract_info_raw(data)
    info_hash = hashlib.sha1(info_dict_raw).digest()

    info = meta[b'info']

    # --- Pieces ---
    raw_pieces = info[b'pieces']
    pieces = [raw_pieces[i:i + 20] for i in range(0, len(raw_pieces), 20)]

    # --- Files ---
    piece_length = info[b'piece length']
    name = _decode_str(info[b'name'])

    if b'files' in info:
        # Multi-file torrent
        files = []
        for f in info[b'files']:
            parts = [_decode_str(p) for p in f[b'path']]
            files.append(TorrentFile(
                path=str(Path(name) / Path(*parts)),
                length=f[b'length']
            ))
    else:
        # Single-file torrent
        files = [TorrentFile(path=name, length=info[b'length'])]

    total_length = sum(f.length for f in files)

    # --- Trackers ---
    announce = _decode_str(meta.get(b'announce', b''))
    announce_list = [announce] if announce else []
    for tier in meta.get(b'announce-list', []):
        for url in tier:
            url_str = _decode_str(url)
            if url_str not in announce_list:
                announce_list.append(url_str)

    return Torrent(
        name=name,
        info_hash=info_hash,
        piece_length=piece_length,
        pieces=pieces,
        files=files,
        announce=announce,
        announce_list=announce_list,
        total_length=total_length,
        comment=_decode_str(meta.get(b'comment', b'')),
        created_by=_decode_str(meta.get(b'created by', b'')),
    )


def _extract_info_raw(data: bytes) -> bytes:
    """Extract the raw bencoded info dict bytes (needed for SHA1)."""
    # Find 4:info then grab the bencoded value
    marker = b'4:info'
    idx = data.find(marker)
    if idx == -1:
        raise ValueError("No 'info' key found in torrent file")
    start = idx + len(marker)
    # Walk forward to find the end of the bencoded value
    _, end = _bencode_end(data, start)
    return data[start:end]


def _bencode_end(data: bytes, idx: int) -> tuple[None, int]:
    """Walk past one bencoded value and return (None, end_idx)."""
    ch = chr(data[idx])
    if ch == 'i':
        end = data.index(b'e', idx) + 1
        return None, end
    if ch == 'l' or ch == 'd':
        idx += 1
        while data[idx:idx + 1] != b'e':
            _, idx = _bencode_end(data, idx)
        return None, idx + 1
    if ch.isdigit():
        colon = data.index(b':', idx)
        length = int(data[idx:colon])
        return None, colon + 1 + length
    raise ValueError(f"Unexpected token '{ch}' at {idx}")
