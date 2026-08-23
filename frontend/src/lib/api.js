import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export default api;

// --- Documents / Ingestion ---
export const uploadDocument = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/documents/upload", formData);
};

export const getDocumentQueue = () =>
  api.get("/document/queue");

// --- NLP ---
export const extractDocument = (documentId) =>
  api.post(`/nlp/extract/${documentId}`);

// --- AI Search / Chatbot ---
export const askDocuments = (question) =>
  api.post("/chatbot/ask", {
    question,
  });

// --- Compliance ---
export const getAllDocuments = () =>
  api.get("/compliance/");

export const getUpcomingCompliance = () =>
  api.get("/compliance/upcoming");

export const getComplianceStats = () =>
  api.get("/compliance/stats");

export const getDocumentCompliance = (documentId) =>
  api.get(`/compliance/${documentId}`);

// --- Analytics ---
export const getAnalyticsSummary = () =>
  api.get("/analytics/summary");