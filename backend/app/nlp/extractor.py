
import json

from app.nlp.llm_client import call_llm
from app.nlp.prompts import EXTRACTION_PROMPT

ALLOWED_DOC_TYPES = {
    "Invoices",
    "Contracts",
    "Compliance / Safety Certificates",
    "Purchase Orders",
    "Maintenance Reports",
    "HR Documents",
    "Memos / Circulars",
    "Vendor Correspondence",
    "Engineering Drawings / Specs",
    "Others",
}
def extract_document_data(document_text: str) -> dict:
    """
    Extract structured information from document text using the LLM.
    """

    if not document_text or not document_text.strip():
        raise ValueError("Document text cannot be empty.")

    # Replace only our actual placeholder.
    prompt = EXTRACTION_PROMPT.replace(
        "{document_text}",
        document_text
    )

    response = call_llm(prompt)

    # Clean accidental markdown code fences.
    cleaned_response = response.strip()

    if cleaned_response.startswith("```"):
        if cleaned_response.startswith("```json"):
            cleaned_response = cleaned_response[7:]

        elif cleaned_response.startswith("```"):
            cleaned_response = cleaned_response[3:]

        if cleaned_response.endswith("```"):
            cleaned_response = cleaned_response[:-3]

        cleaned_response = cleaned_response.strip()

    try:
        result = json.loads(cleaned_response)

    except json.JSONDecodeError as error:
        raise ValueError(
            f"LLM returned invalid JSON:\n{response}"
        ) from error

    doc_type = result.get("doc_type")

    if doc_type not in ALLOWED_DOC_TYPES:
        result["doc_type"] = "Others"

    return result