from pathlib import Path

from pypdf import PdfReader


FILES = [
    Path(r"C:\Users\yoeli\Downloads\Plan_Maestro_Rutina_Ventas_90_Dias.pdf"),
    Path(r"C:\Users\yoeli\Downloads\Modelo 3D Lancha para Blender.pdf"),
]
OUT_DIR = Path(__file__).resolve().parents[1] / "references" / "extracted"


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for source in FILES:
        reader = PdfReader(source)
        pages = []
        for index, page in enumerate(reader.pages, start=1):
            pages.append(f"--- PAGE {index} ---\n{page.extract_text() or ''}")
        destination = OUT_DIR / f"{source.stem}.txt"
        destination.write_text("\n\n".join(pages), encoding="utf-8")
        print(
            f"{source.name}: pages={len(reader.pages)}, "
            f"chars={destination.stat().st_size}, output={destination}"
        )


if __name__ == "__main__":
    main()
