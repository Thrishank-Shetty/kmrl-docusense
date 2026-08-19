from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base,engine
from app.ingestion.router import router as ingestion_router

app=FastAPI()

app.add_middleware(
CORSMiddleware,
allow_origins=["http://localhost:5173"],
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


app.include_router(
    ingestion_router,
    prefix="/documents"
)