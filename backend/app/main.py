
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.ingestion.router import router as ingestion_router
from app.compliance.router import router as compliance_router
from app.nlp.router import router as nlp_router
from app.search.router import router as search_router
from app.chatbot.router import router as chatbot_router
from app.database import Base, engine

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)

app.include_router(ingestion_router, prefix="/documents", tags=["Ingestion"])
app.include_router(compliance_router)
app.include_router(nlp_router)
app.include_router(search_router)
app.include_router(chatbot_router)



@app.get("/health")
def health():
    return {"status": "ok"}
