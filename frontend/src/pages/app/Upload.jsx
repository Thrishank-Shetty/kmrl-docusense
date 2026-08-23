import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  Check,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { uploadDocument, extractDocument } from "../../lib/api";
import { useToast } from "../../components/common/useToast.js";

function Upload() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // status: idle | uploading | uploaded | extracting | done | error
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [extraction, setExtraction] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported right now.");
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setError(null);
    setResult(null);
    setExtraction(null);

    try {
      const response = await uploadDocument(file);

      // Backend now returns:
      // { total_files, results: [...] }
      const uploadedResult = response.data.results[0];

      setResult(uploadedResult);
      setStatus("uploaded");

      showToast("Document uploaded successfully");

      setUploadedFiles((prev) => [
        {
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          date: new Date().toLocaleString(),
          document_id: uploadedResult.document_id,
          status: "Uploaded",
        },
        ...prev,
      ]);
    } catch (err) {
      console.error("Upload failed:", err);

      setStatus("error");

      showToast(
        err.response?.data?.detail ||
          "Upload failed. Please try again.",
        "error"
      );

      setError(
        err.response?.data?.detail ||
          "Upload failed. Check that the backend is running."
      );
    }
  };

  const handleRunExtraction = async () => {
    if (!result?.document_id) return;

    setStatus("extracting");
    setError(null);

    try {
      const response = await extractDocument(result.document_id);

      setExtraction(response.data);
      setStatus("done");

      showToast("Document processed successfully");

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.document_id === result.document_id
            ? { ...f, status: "Processed" }
            : f
        )
      );
    } catch (err) {
      console.error("Extraction failed:", err);

      setStatus("error");

      showToast(
        err.response?.data?.detail ||
          "NLP extraction failed. Please try again.",
        "error"
      );

      setError(
        err.response?.data?.detail ||
          "NLP extraction failed."
      );
    }
  };

  return (
    <div className="min-h-full bg-[#fafbff] px-5 py-5">
      {/* Page Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold leading-tight text-[#061f3d]">
            Upload & Analyze Document
          </h1>

          <p className="mt-1 text-[11px] text-slate-500">
            Upload a KMRL document and let AI extract structured information
            automatically.
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <label
        htmlFor="document-upload"
        className="group flex h-[237px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-white transition hover:border-[#568fe8] hover:bg-[#fcfdff]"
      >
        <input
          id="document-upload"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={
            status === "uploading" ||
            status === "extracting"
          }
        />

        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4ff]">
          {status === "uploading" ||
          status === "extracting" ? (
            <Loader2
              size={23}
              strokeWidth={1.8}
              className="animate-spin text-[#0056a6]"
            />
          ) : (
            <UploadCloud
              size={23}
              strokeWidth={1.8}
              className="text-[#0056a6]"
            />
          )}
        </div>

        <h2 className="text-[14px] font-semibold text-[#062f5c]">
          {status === "uploading"
            ? "Uploading..."
            : status === "extracting"
            ? "Running NLP extraction..."
            : "Upload your document"}
        </h2>

        <p className="mt-1 text-[10px] text-slate-500">
          Drag and drop a PDF here
        </p>

        <span className="mt-4 rounded-md bg-[#003b73] px-5 py-2 text-[10px] font-semibold text-white shadow-sm transition group-hover:bg-[#064b8c]">
          Browse Files
        </span>

        <p className="mt-2.5 text-[8px] text-slate-400">
          PDF only (backend limitation)
        </p>
      </label>

      {/* Error state */}
      {status === "error" && error && (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[10px] text-red-700">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Success state + next action */}
      {result && status !== "error" && (
        <div className="mt-3 rounded-md border border-green-200 bg-green-50 px-3.5 py-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-green-800">
            <Check size={14} />
            Uploaded — Document #{result.document_id}
          </div>

          <p className="mt-1 text-[9px] text-green-700">
            OCR confidence:{" "}
            {(result.confidence * 100).toFixed(1)}%
          </p>

          {status === "uploaded" && (
            <button
              onClick={handleRunExtraction}
              className="mt-2 rounded-md bg-[#003b73] px-4 py-1.5 text-[10px] font-semibold text-white hover:bg-[#064b8c]"
            >
              Run NLP Extraction
            </button>
          )}

          {status === "done" && extraction && (
            <div className="mt-3 border-t border-green-200 pt-3">
              <p className="text-[10px] font-semibold text-[#062f5c]">
                Type:{" "}
                {extraction.document.doc_type ||
                  "Unclassified"}
              </p>

              {extraction.document.summary && (
                <p className="mt-1 text-[9px] text-slate-600">
                  {extraction.document.summary}
                </p>
              )}

              {extraction.risk.has_deadline ? (
                <p className="mt-1 text-[9px] text-slate-600">
                  Deadline:{" "}
                  {String(
                    extraction.risk.deadline_date
                  )}{" "}
                  · Urgency:{" "}
                  <span className="font-semibold">
                    {extraction.risk.urgency}
                  </span>
                </p>
              ) : (
                <p className="mt-1 text-[9px] text-slate-500">
                  No compliance deadline detected.
                </p>
              )}

              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => navigate("/compliance")}
                  className="rounded-md border border-[#003b73] px-3 py-1.5 text-[9px] font-semibold text-[#003b73] hover:bg-[#eef4ff]"
                >
                  View in Compliance
                </button>

                <button
                  onClick={() => navigate("/documents")}
                  className="rounded-md border border-[#003b73] px-3 py-1.5 text-[9px] font-semibold text-[#003b73] hover:bg-[#eef4ff]"
                >
                  View in Documents
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Uploads */}
      <section className="mt-4 overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="flex h-[39px] items-center justify-between border-b border-slate-200 bg-[#fafbff] px-3.5">
          <h2 className="text-[10px] font-semibold text-[#062f5c]">
            Recent Uploads
          </h2>
        </div>

        <div className="grid grid-cols-[1.7fr_1fr_0.7fr_0.7fr] border-b border-slate-200 bg-[#fcfcfd] px-3.5 py-2">
          <span className="text-[7px] font-medium uppercase tracking-wide text-slate-500">
            Document
          </span>

          <span className="text-[7px] font-medium uppercase tracking-wide text-slate-500">
            Uploaded
          </span>

          <span className="text-[7px] font-medium uppercase tracking-wide text-slate-500">
            Size
          </span>

          <span className="text-[7px] font-medium uppercase tracking-wide text-slate-500">
            Status
          </span>
        </div>

        {uploadedFiles.length === 0 ? (
          <div className="px-3.5 py-6 text-center text-[9px] text-slate-400">
            No documents uploaded this session yet.
          </div>
        ) : (
          uploadedFiles.map((file) => (
            <div
              key={file.document_id}
              className="grid min-h-[41px] grid-cols-[1.7fr_1fr_0.7fr_0.7fr] items-center border-b border-slate-200 px-3.5 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <FileText
                  size={14}
                  strokeWidth={1.8}
                  className="text-red-500"
                />

                <span className="text-[9px] font-medium text-[#173a61]">
                  {file.name}
                </span>
              </div>

              <span className="text-[8px] text-slate-500">
                {file.date}
              </span>

              <span className="text-[8px] text-slate-500">
                {file.size}
              </span>

              <span
                className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[7px] font-medium ${
                  file.status === "Processed"
                    ? "bg-[#e8f0ed] text-[#315b50]"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {file.status}
              </span>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default Upload;