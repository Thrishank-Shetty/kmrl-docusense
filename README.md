# KMRL DocuSense

### Infrastructure Intelligence through AI-powered Document Processing

KMRL DocuSense is a full-stack document intelligence platform built for infrastructure operations teams. It automates the ingestion, OCR, entity extraction, compliance risk detection, and management of operational documents — replacing manual review with an AI-driven pipeline powered by Google Gemini and Groq.

---

## Key Features

| Feature | Description |
|---|---|
| **PDF Upload & Ingestion** | Upload single or batch PDF documents via a drag-and-drop interface |
| **Duplicate Detection** | SHA-256 hash-based exact-duplicate detection prevents redundant processing |
| **OCR Pipeline** | Hybrid OCR: native text extraction for digital PDFs; Pytesseract (eng + mal) for scanned documents |
| **AI Extraction** | LLM-powered extraction of document type, summary, named entities, deadlines, and risk metadata |
| **LLM Fallback** | Gemini (primary) → Groq (fallback) ensures extraction availability |
| **Compliance Risk Engine** | Classifies extracted compliance items by urgency (`critical`, `high`, `low`) with deadline tracking |
| **Manual Review Queue** | Documents with extraction confidence < 70% and not yet human-verified are flagged for manual review |
| **AI Search** | Full-text search across all document raw text |
| **Analytics Dashboard** | Real-time KPIs: total processed, compliance score, weekly volume, document type distribution, urgency breakdown |
| **Compliance Dashboard** | Overdue items, items due in 7 days, upcoming deadlines, urgency-filtered views |
| **Document Manager** | Paginated document list with search, type/status filters, sort controls, and inline compliance detail expansion |
| **Collapsible Sidebar** | ChatGPT-style fixed sidebar with smooth collapse/expand animation and hover-reveal interaction |

---

## Dashboard

The main dashboard provides an at-a-glance operational overview powered by live API data:

- **Total Documents Processed** — count of all ingested documents
- **Critical Risks** — documents with `critical` urgency compliance items requiring immediate action
- **Due in 7 Days** — compliance deadlines expiring within the next 7 days
- **Overdue** — compliance items whose deadline has already passed
- **Recent Activity** — live feed of document processing events
- **Quick Actions** — Upload Documents, Search Docs, Generate Report shortcuts
- **Document Distribution** — categorical breakdown (Technical Specs, Safety Manuals, Financial Records, Legal Contracts)
- **Storage Usage** — current storage metric

---

## Document Intelligence Workflow

```mermaid
flowchart TD
    A[PDF Upload] --> B{Duplicate Check SHA-256 Hash}
    B -- Duplicate --> Z[Return Existing Document ID]
    B -- New --> C[OCR / Text Extraction]
    C --> C1{Scanned PDF?}
    C1 -- No --> C2[Native Text Extraction via PyMuPDF]
    C1 -- Yes --> C3[Pytesseract OCR eng + mal language]
    C2 --> D[LLM Extraction Gemini then Groq fallback]
    C3 --> D
    D --> E[Structured Output doc_type, summary, entities, compliance_risk, confidence]
    E --> F{Confidence >= 0.70?}
    F -- Yes --> G[Stored as Processed]
    F -- No --> H[Flagged for Manual Review human_verified = false]
    E --> I[Compliance Items Written to DB deadline, risk_type, urgency]
```

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool & dev server |
| React Router DOM | 7 | Client-side routing |
| Tailwind CSS | 4 | Utility-first styling |
| Axios | 1.x | HTTP client |
| Lucide React | 1.x | Icon library |

### Backend

| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| Uvicorn | ASGI server |
| SQLAlchemy | ORM |
| Pydantic | Request/response validation |
| python-multipart | File upload handling |
| python-dotenv | Environment variable loading |

### Database

| Technology | Purpose |
|---|---|
| PostgreSQL | Primary relational database (via psycopg2-binary) |

### AI / ML

| Technology | Purpose |
|---|---|
| Google Gemini (gemini-3.7-flash) | Primary LLM for document extraction |
| Groq | Fallback LLM provider |
| Pytesseract | OCR engine for scanned PDFs |
| PyMuPDF (pymupdf) | Native PDF text extraction |
| pdf2image | PDF-to-image conversion for OCR |
| Pillow | Image processing |
| OpenCV (cv2) | Image preprocessing (grayscale, contrast, denoising, thresholding) |
| EasyOCR | Additional OCR dependency |

---

## Project Structure

```
kmrl-docusense/
├── backend/
│   ├── app/
│   │   ├── analytics/
│   │   │   └── router.py          # Analytics KPI endpoints
│   │   ├── chatbot/
│   │   │   └── router.py          # Chatbot/AI assistant endpoint
│   │   ├── compliance/
│   │   │   └── router.py          # Compliance risk endpoints & stats
│   │   ├── documents/
│   │   │   └── router.py          # Document management endpoints
│   │   ├── ingestion/
│   │   │   ├── file_utils.py      # PDF type detection & text utilities
│   │   │   ├── ocr.py             # OCR pipeline (Tesseract + preprocessing)
│   │   │   └── router.py          # Upload & ingestion endpoints
│   │   ├── nlp/
│   │   │   ├── extractor.py       # LLM extraction orchestration
│   │   │   ├── llm_client.py      # Gemini / Groq LLM clients with fallback
│   │   │   ├── prompts.py         # Structured extraction prompt
│   │   │   └── router.py          # NLP trigger endpoints
│   │   ├── search/
│   │   │   └── router.py          # Full-text search endpoint
│   │   ├── config.py              # Environment variable loading
│   │   ├── database.py            # SQLAlchemy engine & session
│   │   ├── main.py                # FastAPI app, CORS, router registration
│   │   ├── models.py              # Document & ComplianceItem ORM models
│   │   └── schemas.py             # Pydantic response schemas
│   ├── requirements.txt
│   └── test_contract.txt          # Sample test document
├── demo-data/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # Shared UI components (Toast, etc.)
│   │   │   └── layout/
│   │   │       ├── AppLayout.jsx  # Root layout with sidebar state
│   │   │       ├── Header.jsx     # Top header bar
│   │   │       └── Sidebar.jsx    # Collapsible navigation sidebar
│   │   ├── features/
│   │   │   ├── extraction/        # Extraction feature components
│   │   │   └── upload/            # Upload feature components
│   │   ├── lib/
│   │   │   └── api.js             # Axios API client & endpoint helpers
│   │   ├── pages/
│   │   │   ├── app/
│   │   │   │   ├── Activity.jsx
│   │   │   │   ├── AiSearch.jsx
│   │   │   │   ├── Analytics.jsx
│   │   │   │   ├── Compliance.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Documents.jsx
│   │   │   │   ├── NotFound.jsx
│   │   │   │   ├── Settings.jsx
│   │   │   │   └── Upload.jsx
│   │   │   └── auth/
│   │   │       ├── Login.jsx
│   │   │       └── Register.jsx
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx      # React Router route definitions
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **Python** >= 3.10
- **PostgreSQL** running and accessible
- **Tesseract OCR** installed and on PATH (with `eng` and `mal` language packs)
- **Poppler** installed (required by `pdf2image`)

### 1. Clone the Repository

```bash
git clone https://github.com/Thrishank-Shetty/kmrl-docusense.git
cd kmrl-docusense
```

### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory (see Environment Variables below).

```bash
# Run the development server
uvicorn app.main:app --reload
```

The backend API will be available at `http://127.0.0.1:8000`.
Interactive API docs: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 4. Build for Production

```bash
cd frontend
npm run build
npm run preview
```

---

## Environment Variables

Create `backend/.env` with the following variables:

```env
# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/kmrl_docusense

# Google Gemini API key (primary LLM)
GEMINI_API_KEY=your_gemini_api_key_here

# Groq API key (fallback LLM)
GROQ_API_KEY=your_groq_api_key_here
```

> **Never commit real API keys or credentials.**
> `.env` is already included in `.gitignore`.

Optionally, configure the frontend API base URL:

```env
# frontend/.env (optional — defaults to http://127.0.0.1:8000)
VITE_API_URL=http://127.0.0.1:8000
```

---

## UI / UX

### Navigation Sidebar

- **Fixed position** — the sidebar remains stationary as the main content area scrolls independently.
- **Collapsible** — toggles between a full-width expanded state (220 px) and an icon-only collapsed state (60 px) with a smooth CSS transition.
- **ChatGPT-style hover interaction** — in the collapsed state, the KMRL DocuSense logo is always visible. Hovering over it reveals a toggle icon and an "Open sidebar" tooltip; the tooltip disappears immediately on mouse leave.
- **Edge rail** — a subtle hover-sensitive rail on the collapsed sidebar's right edge provides an alternative expand trigger with an arrow indicator.
- **Settings pinned** — the Settings navigation item is always pinned to the bottom of the sidebar viewport.

### Pages

| Route | Page | Description |
|---|---|---|
| `/dashboard` | Dashboard | KPI metrics, recent activity, quick actions |
| `/documents` | Documents | Paginated document list with filters and inline compliance detail |
| `/upload` | Upload | PDF drag-and-drop with real-time processing status |
| `/ai-search` | AI Search | Full-text document search |
| `/compliance` | Compliance | Upcoming deadlines and risk items by urgency |
| `/analytics` | Analytics | Charts for volume, compliance score, doc types, urgency distribution |
| `/activity` | Activity | Activity log |
| `/settings` | Settings | Application settings |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/documents/upload` | Upload and process one or more PDF files |
| `GET` | `/compliance/` | List all documents |
| `GET` | `/compliance/stats` | Compliance KPI summary |
| `GET` | `/compliance/upcoming` | Upcoming compliance deadlines |
| `GET` | `/compliance/{document_id}` | Compliance detail for a document |
| `POST` | `/compliance/analyze` | Analyze raw document text directly |
| `GET` | `/search?q=` | Full-text search across documents |
| `POST` | `/nlp/extract/{document_id}` | Trigger NLP extraction for a document |
| `GET` | `/analytics/summary` | Analytics KPIs and breakdowns |

---

## Project Status

> **Hackathon Prototype**
> KMRL DocuSense was developed as a hackathon project. The core document intelligence pipeline — upload, OCR, LLM extraction, compliance risk detection, and analytics — is fully functional. Some pages (Activity, Settings) are placeholder views pending further development.

---

## License

This project is not currently licensed for public distribution. All rights reserved.
