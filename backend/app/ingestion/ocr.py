
import pytesseract
import numpy as np

from .file_utils import (
    is_scanned_pdf,
    extract_text_native,
    pdf_to_images
)


def run_ocr(image):
    image = np.array(image)

    text = pytesseract.image_to_string(
        image,
        lang="eng+mal"
    )

    return text, 1.0


def process_document(file_path):

    if not is_scanned_pdf(file_path):

        text = extract_text_native(file_path)

        return {
            "raw_text": text,
            "confidence": 1.0
        }

    images = pdf_to_images(file_path)

    all_text = []
    all_confidences = []

    for image in images:

        text, confidence = run_ocr(image)

        all_text.append(text)
        all_confidences.append(confidence)

    raw_text = "\n".join(all_text)

    if all_confidences:
        average_confidence = sum(all_confidences) / len(all_confidences)
    else:
        average_confidence = 0

    return {
        "raw_text": raw_text,
        "confidence": average_confidence
    }