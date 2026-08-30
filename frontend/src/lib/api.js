import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

export default api;

// --- Documents / Ingestion ---

// Supports both single-file and bulk uploads
export const uploadDocument = (files) => {
  const formData = new FormData();

  if (Array.isArray(files)) {
    files.forEach((file) => {
      formData.append("files", file);
    });
  } else {
    formData.append("files", files);
  }

  return api.post(
    "/documents/upload",
    formData
  );
};

export const getDocumentQueue = () =>
  api.get("/documents/queue");

// Replace an existing document with a newer version
export const replaceDocument = (
  documentId,
  file
) => {
  const formData = new FormData();

  formData.append("file", file);

  return api.post(
    `/documents/replace/${documentId}`,
    formData
  );
};

// --- NLP ---

export const extractDocument = (
  documentId
) =>
  api.post(
    `/nlp/extract/${documentId}`
  );

// --- AI Search / Chatbot ---

export const askDocument = (
  documentId,
  question
) =>
  api.post(
    `/chatbot/ask/${documentId}`,
    {
      question,
    }
  );

// --- Compliance ---

export const getAllDocuments = () =>
  api.get("/compliance/");

export const getUpcomingCompliance = () =>
  api.get("/compliance/upcoming");

export const getComplianceStats = () =>
  api.get("/compliance/stats");

export const getDocumentCompliance = (
  documentId
) =>
  api.get(
    `/compliance/${documentId}`
  );

// --- Analytics ---

export const getAnalyticsSummary = () =>
  api.get("/analytics/summary");

// --- Human Review ---

export const getReviewRequiredDocuments =
  () =>
    api.get(
      "/documents/review-required"
    );

export const verifyDocument = (
  documentId
) =>
  api.post(
    `/documents/${documentId}/verify`
  );

// --- Document Change History ---

export const getDocumentChanges = (
  documentId
) =>
  api.get(
    `/documents/${documentId}/changes`
  );

export const getComplianceCalendar = (year, month) =>
  api.get("/compliance/calendar", { params: { year, month } });

export const getRecentActivity = (limit = 10) =>
  api.get("/analytics/activity/recent", { params: { limit } });