import pytesseract
import numpy as np
import cv2

from pytesseract import Output

from .file_utils import (
    is_scanned_pdf,
    extract_text_native,
    pdf_to_images
)


def run_ocr(image):

    image = np.array(image)

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

    # Improve contrast
    gray = cv2.normalize(
        gray,
        None,
        0,
        255,
        cv2.NORM_MINMAX
    )

    # Remove small noise
    gray = cv2.GaussianBlur(
        gray,
        (3, 3),
        0
    )

    # Convert to black and white
    processed = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        11
    )

    data = pytesseract.image_to_data(
        processed,
        lang="eng+mal",
        output_type=Output.DICT,
        config="--psm 6"
    )

    texts = []
    confidences = []

    for i in range(len(data["text"])):

        text = data["text"][i].strip()

        try:
            confidence = float(data["conf"][i])
        except ValueError:
            continue

        if text and confidence >= 0:
            texts.append(text)
            confidences.append(confidence)

    final_text = " ".join(texts)

    if confidences:
        average_confidence = (
            sum(confidences) / len(confidences)
        )
    else:
        average_confidence = 0.0

    # Convert 0-100 to 0-1
    average_confidence = average_confidence / 100

    return final_text, average_confidence


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
        average_confidence = (
            sum(all_confidences) / len(all_confidences)
        )
    else:
        average_confidence = 0.0

    return {
        "raw_text": raw_text,
        "confidence": average_confidence
    }