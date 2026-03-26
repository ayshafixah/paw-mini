from pathlib import Path

INPUT_MD = Path('docs/engineering-mini-project-abstract.md')
OUTPUT_PDF = Path('docs/engineering-mini-project-abstract.pdf')


def extract_text(md: str):
    lines = []
    for raw in md.splitlines():
        line = raw.rstrip()
        if line.startswith('#'):
            line = line.lstrip('#').strip().upper()
        line = line.replace('**', '')
        if line.startswith('- '):
            line = '\u2022 ' + line[2:]
        lines.append(line)
    return lines


def wrap_line(text: str, max_chars: int = 95):
    if not text:
        return ['']
    words = text.split()
    out = []
    current = words[0]
    for w in words[1:]:
        candidate = current + ' ' + w
        if len(candidate) <= max_chars:
            current = candidate
        else:
            out.append(current)
            current = w
    out.append(current)
    return out


def pdf_escape(s: str) -> str:
    return s.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')


def build_pdf(pages):
    objects = []

    def add_object(content: str):
        objects.append(content)
        return len(objects)

    font_obj = add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")

    page_obj_ids = []
    content_obj_ids = []

    for page_lines in pages:
        stream_lines = ["BT", "/F1 10 Tf", "14 TL", "50 790 Td"]
        first = True
        for line in page_lines:
            if not first:
                stream_lines.append("T*")
            first = False
            stream_lines.append(f"({pdf_escape(line)}) Tj")
        stream_lines.append("ET")
        stream_data = "\n".join(stream_lines).encode('latin-1', errors='replace')
        content_obj = add_object(
            f"<< /Length {len(stream_data)} >>\nstream\n{stream_data.decode('latin-1')}\nendstream"
        )
        content_obj_ids.append(content_obj)

        page_obj = add_object(
            "<< /Type /Page /Parent 0 0 R /MediaBox [0 0 595 842] "
            f"/Resources << /Font << /F1 {font_obj} 0 R >> >> /Contents {content_obj} 0 R >>"
        )
        page_obj_ids.append(page_obj)

    kids = " ".join(f"{pid} 0 R" for pid in page_obj_ids)
    pages_obj = add_object(f"<< /Type /Pages /Count {len(page_obj_ids)} /Kids [ {kids} ] >>")

    # Patch page parent references
    for i, pid in enumerate(page_obj_ids):
        objects[pid - 1] = objects[pid - 1].replace('/Parent 0 0 R', f'/Parent {pages_obj} 0 R')

    catalog_obj = add_object(f"<< /Type /Catalog /Pages {pages_obj} 0 R >>")

    pdf = [b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"]
    offsets = [0]

    for idx, obj in enumerate(objects, start=1):
        offsets.append(sum(len(chunk) for chunk in pdf))
        pdf.append(f"{idx} 0 obj\n{obj}\nendobj\n".encode('latin-1', errors='replace'))

    xref_start = sum(len(chunk) for chunk in pdf)
    xref = [f"xref\n0 {len(objects)+1}\n", "0000000000 65535 f \n"]
    for off in offsets[1:]:
        xref.append(f"{off:010d} 00000 n \n")
    pdf.append("".join(xref).encode('latin-1'))

    trailer = (
        f"trailer\n<< /Size {len(objects)+1} /Root {catalog_obj} 0 R >>\n"
        f"startxref\n{xref_start}\n%%EOF\n"
    )
    pdf.append(trailer.encode('latin-1'))

    return b"".join(pdf)


def main():
    md = INPUT_MD.read_text(encoding='utf-8')
    lines = []
    for line in extract_text(md):
        lines.extend(wrap_line(line))

    lines_per_page = 52
    pages = [lines[i:i+lines_per_page] for i in range(0, len(lines), lines_per_page)]
    pdf_bytes = build_pdf(pages)
    OUTPUT_PDF.write_bytes(pdf_bytes)
    print(f'Generated {OUTPUT_PDF} ({len(pdf_bytes)} bytes)')


if __name__ == '__main__':
    main()
