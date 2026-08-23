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
    "compliance_risks": [],
    "extraction_confidence": 0.0
}

Rules:

1. Use null when information is not present.

2. Do not invent information.

3. Dates should preferably use YYYY-MM-DD format.

4. extraction_confidence must be a number between 0.0 and 1.0.

5. compliance_risks must contain every relevant compliance deadline, obligation, expiry, renewal, inspection, submission, payment, certification, or other time-sensitive compliance requirement found in the document.

6. Each compliance risk must have this exact structure:

{
    "has_deadline": true,
    "deadline_date": "YYYY-MM-DD",
    "risk_type": "Safety Inspection",
    "urgency": null
}

7. has_deadline should be true only when the document contains a relevant deadline, expiry date, renewal date, submission deadline, payment deadline, inspection deadline, certification deadline, or similar compliance-related date.

8. If there are no compliance deadlines or time-sensitive compliance requirements, return an empty compliance_risks array.

9. risk_type must describe the specific compliance obligation associated with the deadline.

Examples of valid risk_type values include:

- "Safety Inspection"
- "Maintenance Report Submission"
- "Insurance Renewal"
- "Safety Certification"
- "Contract Renewal"
- "Payment Deadline"
- "Document Submission"
- "License Renewal"
- "Equipment Inspection"

Do not return null for risk_type when a compliance risk is identified.

10. urgency should be one of:

   - "critical"
   - "high"
   - "medium"
   - "low"
   - null

The urgency provided by the LLM is only an initial classification. The backend risk engine will calculate the final urgency based on the deadline date.

11. If multiple compliance deadlines or obligations are present, create a separate object inside compliance_risks for each one.

12. Do not combine multiple different compliance obligations into one compliance risk.

13. Keep the summary short.

14. Return ONLY the JSON object.

DOCUMENT:

{document_text}
"""