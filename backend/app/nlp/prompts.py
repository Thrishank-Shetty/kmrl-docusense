EXTRACTION_PROMPT = """
You are a document intelligence system for KMRL.

Analyze the following document and extract the requested information.

Return ONLY valid JSON.
Do not use markdown.
Do not add explanations before or after the JSON.

The JSON must follow this exact structure:

{
    "doc_type": null,
    "summary": null,
    "entities": {
        "reference_number": null,
        "department": null,
        "issue_date": null,
        "expiry_date": null,
        "amount": null,
        "vendor_or_party_name": null,
        "asset_id": null
    },
    "compliance_risk": {
        "has_deadline": false,
        "deadline_date": null,
        "risk_type": null,
        "urgency": null
    },
    "extraction_confidence": 0.0
}

Rules:

1. Use null when information is not present.
2. Do not invent information.
3. Dates should preferably use YYYY-MM-DD format.
4. extraction_confidence must be a number between 0.0 and 1.0.
5. has_deadline must be true only when the document contains a relevant deadline, expiry date, renewal date, submission deadline, payment deadline, or similar compliance-related date.
6. urgency should be one of:
   - "critical"
   - "high"
   - "low"
   - null
7. Keep the summary short.
8. Return ONLY the JSON object.

9. The "doc_type" field MUST contain exactly ONE of the following values:

   - "Invoices"
   - "Contracts"
   - "Compliance / Safety Certificates"
   - "Purchase Orders"
   - "Maintenance Reports"
   - "HR Documents"
   - "Memos / Circulars"
   - "Vendor Correspondence"
   - "Engineering Drawings / Specs"
   - "Others"

10. Do not create variations of these document types.
    For example, do NOT return:
    - "Invoice"
    - "Invoice Document"
    - "Billing Invoice"
    - "Purchase Order Document"
    - "Safety Certificate"
    - "Maintenance Report"

    Instead, map them to the exact allowed category:
    - Invoice → "Invoices"
    - Safety Certificate → "Compliance / Safety Certificates"
    - Maintenance Report → "Maintenance Reports"
    - Purchase Order → "Purchase Orders"

11. Use the following classification guidance:

    "Invoices":
    Bills, invoices, tax invoices, payment invoices, billing documents, or documents requesting payment for goods or services.

    "Contracts":
    Agreements, contracts, service agreements, maintenance contracts, vendor agreements, MoUs, or legally binding agreements between parties.

    "Compliance / Safety Certificates":
    Safety certificates, inspection certificates, compliance certificates, licenses, permits, statutory certificates, or documents proving regulatory/compliance requirements have been met.

    "Purchase Orders":
    Purchase orders, procurement orders, or official orders issued to vendors for purchasing goods or services.

    "Maintenance Reports":
    Equipment maintenance reports, inspection reports related to maintenance, repair reports, preventive maintenance records, breakdown reports, or maintenance completion reports.

    "HR Documents":
    Employee-related documents such as appointment letters, leave records, attendance documents, employee notices, salary-related documents, or other personnel records.

    "Memos / Circulars":
    Internal memos, circulars, announcements, notices, instructions, or general organizational communications.

    "Vendor Correspondence":
    Letters, emails, requests, clarifications, quotations, or other correspondence exchanged with vendors or suppliers that does not primarily represent an invoice, purchase order, or contract.

    "Engineering Drawings / Specs":
    Engineering drawings, technical drawings, blueprints, schematics, design documents, technical specifications, or equipment specifications.

    "Others":
    Use this only when the document clearly does not fit any of the nine categories above.

12. If a document could fit multiple categories, choose the category that best represents the document's PRIMARY purpose.

13. Never return a category outside the allowed list.

DOCUMENT:

{document_text}
"""