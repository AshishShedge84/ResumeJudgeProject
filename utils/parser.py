from pathlib import Path
from zipfile import ZipFile

import pdfplumber
from docx import Document


def extract_text(file_path):
    if Path(file_path).suffix.lower() == '.docx':
        # Bound decompression before handing an untrusted OOXML file to the parser.
        with ZipFile(file_path) as archive:
            if sum(item.file_size for item in archive.infolist()) > 50 * 1024 * 1024:
                raise ValueError('DOCX contents are too large.')
        document = Document(file_path)
        lines = [paragraph.text for paragraph in document.paragraphs]
        for table in document.tables:
            lines.extend(' '.join(cell.text for cell in row.cells) for row in table.rows)
        return '\n'.join(lines)
    with pdfplumber.open(file_path) as pdf:
        return '\n'.join(page.extract_text() or '' for page in pdf.pages)
