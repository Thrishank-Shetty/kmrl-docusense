import easyocr
import numpy as np


from .file_utils import (
    is_scanned_pdf,
    extract_text_native,
    pdf_to_images
)



reader = easyocr.Reader(['en'])


def run_ocr(image):
    image = np.array(image)

    results = reader.readtext(image)

    text_parts = []
    confidence_scores = []

    for result in results:
        detected_text = result[1]
        confidence = result[2]

        text_parts.append(detected_text)
        confidence_scores.append(confidence)

    text = " ".join(text_parts)

    if confidence_scores:
        average_confidence = sum(confidence_scores) / len(confidence_scores)
    else:
        average_confidence = 0

    return text, average_confidence


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