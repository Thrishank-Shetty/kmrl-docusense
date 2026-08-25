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


def normalize_doc_type(doc_type):
    """
    Convert reasonable LLM document-type variations
    into the application's standard document types.
    """

    if not doc_type:
        return "Others"

    normalized = doc_type.strip().lower()

    # --------------------------------------------------
    # INVOICES
    # --------------------------------------------------

    if normalized in {
        "invoice",
        "invoices",
        "tax invoice",
        "tax invoices",
        "commercial invoice",
    }:
        return "Invoices"

    # --------------------------------------------------
    # CONTRACTS
    # --------------------------------------------------

    if normalized in {
        "contract",
        "contracts",
        "agreement",
        "agreements",
        "service agreement",
        "service contract",
    }:
        return "Contracts"

    # --------------------------------------------------
    # COMPLIANCE / SAFETY CERTIFICATES
    # --------------------------------------------------

    if normalized in {
        "compliance certificate",
        "compliance certificates",
        "safety certificate",
        "safety certificates",
        "safety certification",
        "safety certifications",
        "compliance / safety certificate",
        "compliance / safety certificates",
    }:
        return "Compliance / Safety Certificates"

    # --------------------------------------------------
    # PURCHASE ORDERS
    # --------------------------------------------------

    if normalized in {
        "purchase order",
        "purchase orders",
        "po",
        "pos",
    }:
        return "Purchase Orders"

    # --------------------------------------------------
    # MAINTENANCE REPORTS
    # --------------------------------------------------

    if (
        "maintenance" in normalized
        and (
            "report" in normalized
            or "inspection" in normalized
            or "service" in normalized
        )
    ):
        return "Maintenance Reports"

    # --------------------------------------------------
    # HR DOCUMENTS
    # --------------------------------------------------

    if normalized in {
        "hr document",
        "hr documents",
        "human resources document",
        "human resources documents",
        "employee document",
        "employee documents",
        "leave document",
        "leave documents",
        "appointment letter",
        "appointment letters",
        "offer letter",
        "offer letters",
    }:
        return "HR Documents"

    # --------------------------------------------------
    # MEMOS / CIRCULARS
    # --------------------------------------------------

    if normalized in {
        "memo",
        "memos",
        "memorandum",
        "memorandums",
        "circular",
        "circulars",
        "memo / circular",
        "memo / circulars",
    }:
        return "Memos / Circulars"

    # --------------------------------------------------
    # VENDOR CORRESPONDENCE
    # --------------------------------------------------

    if normalized in {
        "vendor correspondence",
        "vendor communication",
        "vendor communications",
        "vendor letter",
        "vendor letters",
        "supplier correspondence",
        "supplier communication",
        "supplier communications",
    }:
        return "Vendor Correspondence"

    # --------------------------------------------------
    # ENGINEERING DRAWINGS / SPECS
    # --------------------------------------------------

    if (
        "engineering drawing" in normalized
        or "engineering drawings" in normalized
        or "engineering specification" in normalized
        or "engineering specifications" in normalized
        or normalized in {
            "engineering specs",
            "engineering spec",
            "technical drawing",
            "technical drawings",
            "technical specification",
            "technical specifications",
        }
    ):
        return "Engineering Drawings / Specs"

    # --------------------------------------------------
    # EXACT CANONICAL VALUE
    # --------------------------------------------------

    if doc_type in ALLOWED_DOC_TYPES:
        return doc_type

    # --------------------------------------------------
    # UNKNOWN TYPE
    # --------------------------------------------------

    return "Others"


def extract_document_data(document_text: str) -> dict:
    """
    Extract structured information from document text using the LLM.
    """

    if not document_text or not document_text.strip():
        raise ValueError(
            "Document text cannot be empty."
        )

    # --------------------------------------------------
    # BUILD PROMPT
    # --------------------------------------------------

    prompt = EXTRACTION_PROMPT.replace(
        "{document_text}",
        document_text
    )

    # --------------------------------------------------
    # CALL LLM
    # --------------------------------------------------

    response = call_llm(prompt)

    # --------------------------------------------------
    # CLEAN RESPONSE
    # --------------------------------------------------

    cleaned_response = response.strip()

    if cleaned_response.startswith("```"):

        if cleaned_response.startswith("```json"):
            cleaned_response = cleaned_response[7:]

        else:
            cleaned_response = cleaned_response[3:]

        if cleaned_response.endswith("```"):
            cleaned_response = cleaned_response[:-3]

        cleaned_response = cleaned_response.strip()

    # --------------------------------------------------
    # PARSE JSON
    # --------------------------------------------------

    try:

        result = json.loads(cleaned_response)

    except json.JSONDecodeError as error:

        raise ValueError(
            f"LLM returned invalid JSON:\n{response}"
        ) from error

    # --------------------------------------------------
    # NORMALIZE DOCUMENT TYPE
    # --------------------------------------------------

    original_doc_type = result.get("doc_type")

    normalized_doc_type = normalize_doc_type(
        original_doc_type
    )

    print(
        f"LLM document type: {original_doc_type!r}"
    )

    print(
        f"Normalized document type: {normalized_doc_type!r}"
    )

    result["doc_type"] = normalized_doc_type

    # --------------------------------------------------
    # RETURN RESULT
    # --------------------------------------------------

    return result