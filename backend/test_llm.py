from app.nlp.llm_client import call_llm


sample_document = """
KMRL Contract No. KMRL/2026/045

This contract is between Kochi Metro Rail Limited and ABC Engineering Pvt Ltd.

The contract was issued on 2026-01-15.
The contract will expire on 2026-09-15.

The responsible department is Engineering.
The contract amount is INR 25,00,000.

Please ensure renewal is completed before the expiry date.
"""


prompt = f"""
Analyze the following document and return ONLY valid JSON.

Return this structure:

{{
    "doc_type": null,
    "summary": null,
    "entities": {{
        "reference_number": null,
        "department": null,
        "issue_date": null,
        "expiry_date": null,
        "amount": null,
        "vendor_or_party_name": null,
        "asset_id": null
    }},
    "compliance_risk": {{
        "has_deadline": false,
        "deadline_date": null,
        "risk_type": null,
        "urgency": null
    }},
    "extraction_confidence": 0.0
}}

DOCUMENT:

{sample_document}
"""


print("Calling LLM...")

result = call_llm(prompt)

print("\n===== LLM OUTPUT =====\n")
print(result)