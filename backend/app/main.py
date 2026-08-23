
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware

from app.ingestion.router import router as ingestion_router
from app.compliance.router import router as compliance_router
from app.nlp.router import router as nlp_router
from app.search.router import router as search_router
from app.chatbot.router import router as chatbot_router
from app.documents.router import router as documents_router
from app.database import Base, engine


app = FastAPI()


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    schema = get_openapi(
        title="FastAPI",
        version="0.1.0",
        routes=app.routes,
    )

    for component in schema.get("components", {}).get("schemas", {}).values():
        for prop in component.get("properties", {}).values():

            if prop.get("contentMediaType") == "application/octet-stream":
                del prop["contentMediaType"]
                prop["format"] = "binary"

            items = prop.get("items", {})

            if items.get("contentMediaType") == "application/octet-stream":
                del items["contentMediaType"]
                items["format"] = "binary"

    app.openapi_schema = schema
    return app.openapi_schema


app.openapi = custom_openapi


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
    prefix="/documents",
    tags=["Ingestion"]
)

app.include_router(compliance_router)
app.include_router(nlp_router)
app.include_router(documents_router, tags=["Documents"])


@app.get("/health")
def health():
    return {"status": "ok"}