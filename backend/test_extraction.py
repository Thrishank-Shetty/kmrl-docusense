# test_extraction.py
from app.nlp.extractor import extract_document_data
from app.compliance.risk_engine import calculate_risk

sample_text = """
KMRL Contract No. KMRL/2026/045
This contract is between Kochi Metro Rail Limited and ABC Engineering Pvt Ltd.
The contract was issued on 2026-01-15.
The contract will expire on 2026-09-15.
The responsible department is Engineering.
The contract amount is INR 25,00,000.
"""

extracted = extract_document_data(sample_text)
print("EXTRACTED:", extracted)

risk = calculate_risk(extracted)
print("RISK:", risk)