import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud, Check, FileText, Loader2, AlertCircle,
  ArrowUp, ArrowDown, X, Play, GripVertical,
} from "lucide-react";
import { uploadDocument, extractDocument } from "../../lib/api";
import { useToast } from "../../components/common/useToast.js";

const formatConfidence = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? `${(n * 100).toFixed(1)}%` : "N/A";
};

const statusClass = {
  Processed: "bg-[#e8f0ed] text-[#315b50]",
  Failed: "bg-red-50 text-red-600",
  Extracting: "bg-purple-50 text-purple-600",
  Uploading: "bg-blue-50 text-blue-600",
  Queued: "bg-slate-100 text-slate-500",
};

export default function Upload() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [extraction, setExtraction] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [queue, setQueue] = useState([]);
  const [processingQueue, setProcessingQueue] = useState(false);

  const updateQueueItem = (id, changes) =>
    setQueue((q) =>
      q.map((x) => (x.id === id ? { ...x, ...changes } : x))
    );

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (files.some((f) => !f.name.toLowerCase().endsWith(".pdf"))) {
      setError("Only PDF files are supported right now.");
      setStatus("error");
      return;
    }

    setError(null);
    setStatus("idle");

    const now = Date.now();

    setQueue((q) => [
      ...q,
      ...files.map((file, i) => ({
        id: `${file.name}-${file.lastModified}-${i}-${now}`,
        file,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        status: "Queued",
        document_id: null,
        confidence: null,
        error: null,
      })),
    ]);

    showToast(
      `${files.length} ${files.length === 1 ? "file" : "files"} added to queue`
    );
    e.target.value = "";
  };

  const removeFromQueue = (id) => {
    if (!processingQueue)
      setQueue((q) => q.filter((x) => x.id !== id));
  };

  const moveQueueItem = (index, direction) => {
    if (processingQueue) return;

    setQueue((q) => {
      const next = [...q];
      const target = direction === "up" ? index - 1 : index + 1;

      if (target < 0 || target >= next.length) return q;

      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const uploadSingleDocument = async (item) => {
    const response = await uploadDocument(item.file);
    const results = response.data?.results;

    if (!Array.isArray(results) || !results.length)
      throw new Error("Backend did not return an uploaded document result.");

    const uploaded = results[0];

    if (!uploaded.document_id)
      throw new Error("Backend did not return a document ID.");

    const confidence = Number(uploaded.confidence);

    return {
      ...uploaded,
      document_id: uploaded.document_id,
      confidence: Number.isFinite(confidence) ? confidence : null,
    };
  };

  const addRecentUpload = (
    item,
    uploaded,
    uploadStatus = "Uploaded",
    confidence
  ) =>
    setUploadedFiles((files) => [
      {
        name: item.name,
        size: item.size,
        date: new Date().toLocaleString(),
        document_id: uploaded.document_id,
        status: uploadStatus,
        confidence,
      },
      ...files,
    ]);

  const processQueue = async () => {
    if (processingQueue || !queue.length) return;

    setProcessingQueue(true);
    setError(null);
    setStatus("uploading");

    try {
      for (const item of queue) {
        if (item.status === "Processed") continue;

        updateQueueItem(item.id, {
          status: "Uploading",
          error: null,
        });

        let uploaded;

        try {
          uploaded = await uploadSingleDocument(item);
        } catch (err) {
          console.error(`Upload failed for ${item.name}:`, err);

          updateQueueItem(item.id, {
            status: "Failed",
            error:
              err.response?.data?.detail ||
              err.message ||
              "Upload failed.",
          });

          continue;
        }

        setResult(uploaded);

        updateQueueItem(item.id, {
          status: "Uploaded",
          document_id: uploaded.document_id,
          confidence: uploaded.confidence,
          error: null,
        });

        addRecentUpload(
          item,
          uploaded,
          "Uploaded",
          uploaded.confidence
        );

        updateQueueItem(item.id, { status: "Extracting" });
        setStatus("extracting");

        let extracted;

        try {
          const response = await extractDocument(uploaded.document_id);
          extracted = response.data;
          setExtraction(extracted);
        } catch (err) {
          console.error(`Extraction failed for ${item.name}:`, err);

          updateQueueItem(item.id, {
            status: "Failed",
            error:
              err.response?.data?.detail ||
              err.message ||
              "NLP extraction failed.",
          });

          continue;
        }

        const nlpConfidence = Number(
          extracted?.document?.extraction_confidence ??
          extracted?.extraction_confidence ??
          extracted?.confidence
        );

        const confidence = Number.isFinite(nlpConfidence)
          ? nlpConfidence
          : null;

        updateQueueItem(item.id, {
          status: "Processed",
          confidence: confidence ?? uploaded.confidence,
          error: null,
        });

        setUploadedFiles((files) =>
          files.map((file) =>
            file.document_id === uploaded.document_id
              ? {
                  ...file,
                  status: "Processed",
                  confidence: confidence ?? file.confidence,
                }
              : file
          )
        );

        showToast(`${item.name} processed successfully`);
      }

      setStatus("done");
      showToast("Queue processing completed");
    } catch (err) {
      console.error("Queue processing failed:", err);

      setStatus("error");
      setError(
        err.response?.data?.detail ||
        err.message ||
        "Queue processing failed."
      );
    } finally {
      setProcessingQueue(false);
    }
  };

  const clearCompleted = () => {
    if (!processingQueue)
      setQueue((q) => q.filter((x) => x.status !== "Processed"));
  };

  const retryFailedItem = (id) =>
    setQueue((q) =>
      q.map((x) =>
        x.id === id
          ? { ...x, status: "Queued", error: null }
          : x
      )
    );

  const queuedCount = queue.filter((x) => x.status === "Queued").length;
  const processedCount = queue.filter(
    (x) => x.status === "Processed"
  ).length;
  const failedCount = queue.filter((x) => x.status === "Failed").length;

  return (
    <div className="min-h-full bg-[#fafbff] px-5 py-5">
      <div className="mb-3">
        <h1 className="text-[24px] font-bold leading-tight text-[#061f3d]">
          Upload & Analyze Documents
        </h1>
        <p className="mt-1 text-[11px] text-slate-500">
          Upload KMRL documents and process them through OCR and AI extraction.
        </p>
      </div>

      <label
        htmlFor="document-upload"
        className={`group flex h-[190px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-white transition hover:border-[#568fe8] hover:bg-[#fcfdff] ${
          processingQueue ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <input
          id="document-upload"
          type="file"
          accept=".pdf"
          multiple
          hidden
          onChange={handleFileChange}
          disabled={processingQueue}
        />

        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4ff]">
          {processingQueue ? (
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
          {processingQueue
            ? "Processing queue..."
            : "Upload your documents"}
        </h2>

        <p className="mt-1 text-[10px] text-slate-500">
          Select one or multiple PDF files
        </p>

        <span className="mt-4 rounded-md bg-[#003b73] px-5 py-2 text-[10px] font-semibold text-white shadow-sm transition group-hover:bg-[#064b8c]">
          Browse Files
        </span>

        <p className="mt-2.5 text-[8px] text-slate-400">PDF only</p>
      </label>

      {status === "error" && error && (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[10px] text-red-700">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <section className="mt-4 overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="flex h-[42px] items-center justify-between border-b border-slate-200 bg-[#fafbff] px-3.5">
          <div>
            <h2 className="text-[10px] font-semibold text-[#062f5c]">
              Processing Queue
            </h2>
            <p className="text-[7px] text-slate-400">
              Files are processed from top to bottom
            </p>
          </div>

          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <button
                type="button"
                onClick={clearCompleted}
                disabled={processingQueue || !processedCount}
                className="text-[8px] font-medium text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear completed
              </button>
            )}

            <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[7px] font-semibold text-[#0056a6]">
              {queue.length} {queue.length === 1 ? "file" : "files"}
            </span>
          </div>
        </div>

        {!queue.length ? (
          <div className="px-3.5 py-8 text-center">
            <FileText size={20} className="mx-auto text-slate-300" />
            <p className="mt-2 text-[9px] font-medium text-slate-500">
              Queue is empty
            </p>
            <p className="mt-1 text-[8px] text-slate-400">
              Select multiple PDFs above to create a processing queue.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[28px_1.8fr_0.7fr_0.7fr_90px] border-b border-slate-200 bg-[#fcfcfd] px-3.5 py-2">
              {["#", "Document", "Confidence", "Status", "Order"].map(
                (title) => (
                  <span
                    key={title}
                    className={`text-[7px] font-medium uppercase tracking-wide text-slate-500 ${
                      title === "Order" ? "text-center" : ""
                    }`}
                  >
                    {title}
                  </span>
                )
              )}
            </div>

            {queue.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-[28px_1.8fr_0.7fr_0.7fr_90px] items-center border-b border-slate-100 px-3.5 py-2.5 last:border-b-0"
              >
                <span className="text-[8px] font-semibold text-slate-400">
                  {index + 1}
                </span>

                <div className="flex min-w-0 items-center gap-2">
                  <GripVertical
                    size={13}
                    className="shrink-0 text-slate-300"
                  />
                  <FileText
                    size={14}
                    className="shrink-0 text-red-500"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-[9px] font-medium text-[#173a61]">
                      {item.name}
                    </p>
                    <p className="text-[7px] text-slate-400">
                      {item.size}
                    </p>
                    {item.error && (
                      <p className="mt-0.5 truncate text-[7px] text-red-500">
                        {item.error}
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className={`text-[8px] font-semibold ${
                    item.confidence === null
                      ? "text-slate-400"
                      : Number(item.confidence) < 0.7
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  {formatConfidence(item.confidence)}
                </span>

                <div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[7px] font-medium ${
                      statusClass[item.status] || statusClass.Queued
                    }`}
                  >
                    {["Uploading", "Extracting"].includes(item.status) ? (
                      <Loader2 size={8} className="animate-spin" />
                    ) : item.status === "Processed" ? (
                      <Check size={8} />
                    ) : null}
                    {item.status}
                  </span>

                  {item.status === "Failed" && (
                    <button
                      type="button"
                      onClick={() => retryFailedItem(item.id)}
                      disabled={processingQueue}
                      className="ml-1 text-[7px] font-semibold text-red-500 hover:text-red-700"
                    >
                      Retry
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    title="Move up"
                    disabled={processingQueue || index === 0}
                    onClick={() => moveQueueItem(index, "up")}
                    className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowUp size={11} />
                  </button>

                  <button
                    type="button"
                    title="Move down"
                    disabled={
                      processingQueue || index === queue.length - 1
                    }
                    onClick={() => moveQueueItem(index, "down")}
                    className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowDown size={11} />
                  </button>

                  <button
                    type="button"
                    title="Remove"
                    disabled={processingQueue}
                    onClick={() => removeFromQueue(item.id)}
                    className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <X size={11} />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between border-t border-slate-200 bg-[#fafbff] px-3.5 py-2.5">
              <div className="flex items-center gap-3 text-[7px] text-slate-400">
                <span>
                  Queued:{" "}
                  <b className="text-slate-600">{queuedCount}</b>
                </span>
                <span>
                  Processed:{" "}
                  <b className="text-green-600">{processedCount}</b>
                </span>
                <span>
                  Failed:{" "}
                  <b className="text-red-500">{failedCount}</b>
                </span>
              </div>

              <button
                type="button"
                onClick={processQueue}
                disabled={
                  processingQueue || !queue.length || queuedCount === 0
                }
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#003b73] px-4 text-[9px] font-semibold text-white transition hover:bg-[#064b8c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processingQueue ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play size={11} fill="currentColor" />
                    Process Queue
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </section>

      {result && !processingQueue && status !== "error" && (
        <div className="mt-3 rounded-md border border-green-200 bg-green-50 px-3.5 py-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-green-800">
            <Check size={14} />
            Uploaded — Document #{result.document_id}
          </div>

          <p className="mt-1 text-[9px] text-green-700">
            OCR confidence: {formatConfidence(result.confidence)}
          </p>

          {status === "done" && extraction && (
            <div className="mt-3 border-t border-green-200 pt-3">
              <p className="text-[10px] font-semibold text-[#062f5c]">
                Type: {extraction.document?.doc_type || "Unclassified"}
              </p>

              {extraction.document?.summary && (
                <p className="mt-1 text-[9px] text-slate-600">
                  {extraction.document.summary}
                </p>
              )}

              {extraction.risk?.has_deadline ? (
                <p className="mt-1 text-[9px] text-slate-600">
                  Deadline: {String(extraction.risk.deadline_date)} · Urgency:{" "}
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

      <section className="mt-4 overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="flex h-[39px] items-center justify-between border-b border-slate-200 bg-[#fafbff] px-3.5">
          <h2 className="text-[10px] font-semibold text-[#062f5c]">
            Recent Uploads
          </h2>
        </div>

        <div className="grid grid-cols-[1.6fr_0.9fr_0.6fr_0.7fr_0.6fr] border-b border-slate-200 bg-[#fcfcfd] px-3.5 py-2">
          {["Document", "Uploaded", "Size", "Confidence", "Status"].map(
            (title) => (
              <span
                key={title}
                className="text-[7px] font-medium uppercase tracking-wide text-slate-500"
              >
                {title}
              </span>
            )
          )}
        </div>

        {!uploadedFiles.length ? (
          <div className="px-3.5 py-6 text-center text-[9px] text-slate-400">
            No documents uploaded this session yet.
          </div>
        ) : (
          uploadedFiles.map((file) => (
            <div
              key={file.document_id}
              className="grid min-h-[41px] grid-cols-[1.6fr_0.9fr_0.6fr_0.7fr_0.6fr] items-center border-b border-slate-200 px-3.5 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <FileText
                  size={14}
                  strokeWidth={1.8}
                  className="text-red-500"
                />
                <span className="truncate text-[9px] font-medium text-[#173a61]">
                  {file.name}
                </span>
              </div>

              <span className="text-[8px] text-slate-500">{file.date}</span>
              <span className="text-[8px] text-slate-500">{file.size}</span>

              <span
                className={`text-[8px] font-semibold ${
                  file.confidence === null
                    ? "text-slate-400"
                    : Number(file.confidence) < 0.7
                    ? "text-orange-600"
                    : "text-green-600"
                }`}
              >
                {formatConfidence(file.confidence)}
              </span>

              <span
                className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[7px] font-medium ${
                  file.status === "Processed"
                    ? "bg-[#e8f0ed] text-[#315b50]"
                    : file.status === "Failed"
                    ? "bg-red-50 text-red-600"
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