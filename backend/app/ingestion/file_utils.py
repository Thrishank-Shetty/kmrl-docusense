import pymupdf
from pdf2image import convert_from_path


def extract_text_native(file_path):
    document = pymupdf.open(file_path)

    text = ""

    for page in document:
        text += page.get_text()

    document.close()

    return text.strip()


def is_scanned_pdf(file_path):
    text = extract_text_native(file_path)

    if len(text.strip()) < 50:
        return True

    return False


def pdf_to_images(file_path):
    images = convert_from_path(file_path)

    return images