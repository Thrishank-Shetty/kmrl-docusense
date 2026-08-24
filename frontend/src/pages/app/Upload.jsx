import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  Check,
  FileText,
  Loader2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  X,
  Play,
  GripVertical,
  RefreshCw,
} from "lucide-react";
import {
  uploadDocument,
  extractDocument,
  replaceDocument,
} from "../../lib/api";
import { useToast } from "../../components/common/useToast.js";

const formatConfidence = (value) => {
  const confidence = Number(value);
  if (!Number.isFinite(confidence)) return "N/A";
  return `${(confidence * 100).toFixed(1)}%`;
};

const getConfidenceNumber = (value) => {
  const confidence = Number(value);
  return Number.isFinite(confidence) ? confidence : null;
};

const getErrorMessage = (
  error,
  fallback = "Something went wrong."
) => {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || "Validation error")
      .join(", ");
  }

  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

function Upload() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [extraction, setExtraction] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [queue, setQueue] = useState([]);
  const [processingQueue, setProcessingQueue] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const updateQueueItem = (id, changes) => {
    setQueue((currentQueue) =>
      currentQueue.map((item) =>
        item.id === id
          ? { ...item, ...changes }
          : item
      )
    );
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const invalidFiles = files.filter(
      (file) =>
        !file.name.toLowerCase().endsWith(".pdf")
    );

    if (invalidFiles.length) {
      setError("Only PDF files are supported right now.");
      setStatus("error");
      event.target.value = "";
      return;
    }

    setError(null);
    setStatus("idle");

    const timestamp = Date.now();

    const newItems = files.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${timestamp}-${index}`,
      file,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      status: "Queued",
      document_id: null,
      confidence: null,
      error: null,
      duplicate: false,
      newer_version: false,
      existing_document_id: null,
      existing_filename: null,
      reference_number: null,
    }));

    setQueue((currentQueue) => [
      ...currentQueue,
      ...newItems,
    ]);

    showToast(
      `${files.length} ${
        files.length === 1 ? "file" : "files"
      } added to queue`
    );

    event.target.value = "";
  };

  const handleDifferentFile = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported right now.");
      setStatus("error");
      event.target.value = "";
      return;
    }

    const queueId = confirmation?.queueId;

    if (!queueId) {
      event.target.value = "";
      return;
    }

    setQueue((currentQueue) =>
      currentQueue.map((item) =>
        item.id === queueId
          ? {
              ...item,
              id: `${file.name}-${file.lastModified}-${Date.now()}`,
              file,
              name: file.name,
              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              status: "Queued",
              error: null,
              duplicate: false,
              newer_version: false,
              existing_document_id: null,
              existing_filename: null,
              reference_number: null,
              document_id: null,
              confidence: null,
            }
          : item
      )
    );

    setConfirmation(null);
    setError(null);
    setStatus("idle");

    showToast("Different file added to queue");

    event.target.value = "";
  };

  const removeFromQueue = (id) => {
    if (processingQueue) return;

    setQueue((currentQueue) =>
      currentQueue.filter((item) => item.id !== id)
    );
  };

  const moveQueueItem = (index, direction) => {
    if (processingQueue) return;

    setQueue((currentQueue) => {
      const updatedQueue = [...currentQueue];

      const targetIndex =
        direction === "up"
          ? index - 1
          : index + 1;

      if (
        targetIndex < 0 ||
        targetIndex >= updatedQueue.length
      ) {
        return currentQueue;
      }

      [updatedQueue[index], updatedQueue[targetIndex]] = [
        updatedQueue[targetIndex],
        updatedQueue[index],
      ];

      return updatedQueue;
    });
  };

  const addRecentUpload = (
    item,
    documentId,
    confidence,
    uploadStatus = "Uploaded"
  ) => {
    setUploadedFiles((currentFiles) => [
      {
        name: item.name,
        size: item.size,
        date: new Date().toLocaleString(),
        document_id: documentId,
        status: uploadStatus,
        confidence,
      },
      ...currentFiles,
    ]);
  };

  const runExtraction = async (item, documentId) => {
    updateQueueItem(item.id, {
      status: "Extracting",
      error: null,
    });

    setStatus("extracting");

    try {
      const response = await extractDocument(documentId);
      const extracted = response.data;

      setExtraction(extracted);

      const extractedConfidence =
        getConfidenceNumber(
          extracted?.document?.extraction_confidence ??
            extracted?.extraction_confidence ??
            extracted?.confidence
        );

      updateQueueItem(item.id, {
        status: "Processed",
        confidence: extractedConfidence,
        error: null,
      });

      setUploadedFiles((currentFiles) =>
        currentFiles.map((file) =>
          file.document_id === documentId
            ? {
                ...file,
                status: "Processed",
                confidence:
                  extractedConfidence ??
                  file.confidence,
              }
            : file
        )
      );

      return extracted;
    } catch (error) {
      console.error(
        `Extraction failed for ${item.name}:`,
        error
      );

      const message = getErrorMessage(
        error,
        "NLP extraction failed."
      );

      updateQueueItem(item.id, {
        status: "Failed",
        error: message,
      });

      return null;
    }
  };

  const processUploadResult = async (
    item,
    uploadResult
  ) => {
    const documentId = uploadResult?.document_id;

    if (!documentId) {
      updateQueueItem(item.id, {
        status: "Failed",
        error:
          "Backend did not return a document ID.",
      });
      return;
    }

    const confidence = getConfidenceNumber(
      uploadResult?.confidence
    );

    updateQueueItem(item.id, {
      status: "Uploaded",
      document_id: documentId,
      confidence,
      error: null,
    });

    setResult(uploadResult);

    addRecentUpload(
      item,
      documentId,
      confidence,
      "Uploaded"
    );

    await runExtraction(item, documentId);
  };

  // ---------------------------------------------------------
  // IMPORTANT:
  // Backend returns results in the same order as uploaded files.
  // We therefore match:
  //
  // itemsToUpload[0] -> results[0]
  // itemsToUpload[1] -> results[1]
  // itemsToUpload[2] -> results[2]
  //
  // This avoids relying on filename matching or React state
  // having already updated from "Queued" to "Uploading".
  // ---------------------------------------------------------

  const handleBulkResponse = async (
    response,
    itemsToUpload
  ) => {
    const data = response?.data;

    const results = Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data)
      ? data
      : [];

    if (!results.length) {
      throw new Error(
        "Backend did not return any upload results."
      );
    }

    for (
      let index = 0;
      index < results.length;
      index++
    ) {
      const result = results[index];
      const item = itemsToUpload[index];

      if (!item) {
        console.warn(
          "Received an upload result without a matching queue item:",
          result
        );
        continue;
      }

      // -----------------------------------------------------
      // EXACT DUPLICATE
      // -----------------------------------------------------

      if (result?.duplicate === true) {
        updateQueueItem(item.id, {
          status: "Duplicate",
          duplicate: true,
          newer_version: false,
          error:
            result?.message ||
            "This document has already been uploaded.",
          document_id:
            result?.existing_document_id ||
            result?.document_id ||
            null,
        });

        setConfirmation({
          type: "duplicate",
          queueId: item.id,
          name: item.name,
          message:
            result?.message ||
            "This document has already been uploaded.",
          existingFilename:
            result?.existing_filename ||
            result?.filename ||
            null,
        });

        continue;
      }

      // -----------------------------------------------------
      // NEWER VERSION / REPLACEMENT CONFIRMATION
      // -----------------------------------------------------

      if (
        result?.newer_version === true ||
        result?.requires_confirmation === true
      ) {
        updateQueueItem(item.id, {
          status: "Needs Confirmation",
          duplicate: false,
          newer_version: true,
          existing_document_id:
            result?.existing_document_id ||
            null,
          existing_filename:
            result?.existing_filename ||
            null,
          reference_number:
            result?.reference_number ||
            null,
          error:
            result?.message ||
            "An existing document was found.",
        });

        setConfirmation({
          type: "replacement",
          queueId: item.id,
          name: item.name,
          existingDocumentId:
            result?.existing_document_id ||
            null,
          existingFilename:
            result?.existing_filename ||
            null,
          referenceNumber:
            result?.reference_number ||
            null,
          message:
            result?.message ||
            "A document with the same reference number already exists.",
        });

        continue;
      }

      // -----------------------------------------------------
      // NORMAL UPLOAD
      // -----------------------------------------------------

      await processUploadResult(
        item,
        result
      );
    }
  };

  const processQueue = async () => {
    if (processingQueue || !queue.length) return;

    const itemsToUpload = queue.filter(
      (item) =>
        item.status === "Queued" ||
        item.status === "Failed"
    );

    if (!itemsToUpload.length) return;

    setProcessingQueue(true);
    setStatus("uploading");
    setError(null);

    itemsToUpload.forEach((item) =>
      updateQueueItem(item.id, {
        status: "Uploading",
        error: null,
      })
    );

    try {
      const files = itemsToUpload.map(
        (item) => item.file
      );

      const response = await uploadDocument(files);

      // Pass the exact queue items used for this request.
      await handleBulkResponse(
        response,
        itemsToUpload
      );

      setStatus("done");
      showToast("Queue processing completed");
    } catch (error) {
      console.error(
        "Bulk upload failed:",
        error
      );

      const message = getErrorMessage(
        error,
        "Bulk upload failed."
      );

      setStatus("error");
      setError(message);

      setQueue((currentQueue) =>
        currentQueue.map((item) =>
          item.status === "Uploading"
            ? {
                ...item,
                status: "Failed",
                error: message,
              }
            : item
        )
      );
    } finally {
      setProcessingQueue(false);
    }
  };

  const handleReplace = async () => {
    if (
      !confirmation ||
      confirmation.type !== "replacement"
    ) {
      return;
    }

    const queueItem = queue.find(
      (item) =>
        item.id === confirmation.queueId
    );

    if (!queueItem) {
      setConfirmation(null);
      return;
    }

    if (!confirmation.existingDocumentId) {
      setError(
        "The backend did not provide the existing document ID required for replacement."
      );
      setConfirmation(null);
      return;
    }

    setConfirmation((current) =>
      current
        ? { ...current, replacing: true }
        : current
    );

    updateQueueItem(queueItem.id, {
      status: "Replacing",
      error: null,
    });

    try {
      const response = await replaceDocument(
        confirmation.existingDocumentId,
        queueItem.file
      );

      const replacement = response?.data;

      const documentId =
        replacement?.document_id ||
        confirmation.existingDocumentId;

      const confidence = getConfidenceNumber(
        replacement?.confidence
      );

      updateQueueItem(queueItem.id, {
        status: "Replaced",
        document_id: documentId,
        confidence,
        error: null,
      });

      addRecentUpload(
        queueItem,
        documentId,
        confidence,
        "Replaced"
      );

      setResult(replacement);
      setConfirmation(null);

      showToast(
        "Existing document replaced successfully"
      );

      await runExtraction(
        queueItem,
        documentId
      );

      setStatus("done");
    } catch (error) {
      console.error(
        "Document replacement failed:",
        error
      );

      const message = getErrorMessage(
        error,
        "Unable to replace the existing document."
      );

      updateQueueItem(queueItem.id, {
        status: "Failed",
        error: message,
      });

      setConfirmation(null);
      setStatus("error");
      setError(message);
    }
  };

  const handleCancelReplacement = () => {
    if (!confirmation) return;

    if (confirmation.type === "replacement") {
      updateQueueItem(
        confirmation.queueId,
        {
          status: "Skipped",
          error:
            "Replacement cancelled by user.",
        }
      );
    }

    setConfirmation(null);
  };

  const clearCompleted = () => {
    if (processingQueue) return;

    setQueue((currentQueue) =>
      currentQueue.filter(
        (item) =>
          item.status !== "Processed" &&
          item.status !== "Replaced" &&
          item.status !== "Duplicate"
      )
    );
  };

  const retryFailedItem = (id) => {
    if (processingQueue) return;

    updateQueueItem(id, {
      status: "Queued",
      error: null,
      duplicate: false,
      newer_version: false,
      existing_document_id: null,
      existing_filename: null,
      reference_number: null,
    });
  };

  const queuedCount = queue.filter(
    (item) => item.status === "Queued"
  ).length;

  const processedCount = queue.filter(
    (item) =>
      item.status === "Processed" ||
      item.status === "Replaced"
  ).length;

  const failedCount = queue.filter(
    (item) =>
      item.status === "Failed" ||
      item.status === "Duplicate"
  ).length;

  return (
    <div className="min-h-full bg-[#fafbff] px-5 py-5">
      <div className="mb-3">
        <h1 className="text-[24px] font-bold leading-tight text-[#061f3d]">
          Upload & Analyze Documents
        </h1>

        <p className="mt-1 text-[11px] text-slate-500">
          Upload KMRL documents and process
          them through OCR and AI extraction.
        </p>
      </div>

      <label
        htmlFor="document-upload"
        className={`group flex h-[190px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-white transition hover:border-[#568fe8] hover:bg-[#fcfdff] ${
          processingQueue
            ? "pointer-events-none opacity-60"
            : ""
        }`}
      >
        <input
          id="document-upload"
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
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

        <p className="mt-2.5 text-[8px] text-slate-400">
          PDF only
        </p>
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
              Files are processed from top to
              bottom
            </p>
          </div>

          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <button
                type="button"
                onClick={clearCompleted}
                disabled={
                  processingQueue ||
                  processedCount === 0
                }
                className="text-[8px] font-medium text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear completed
              </button>
            )}

            <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[7px] font-semibold text-[#0056a6]">
              {queue.length}{" "}
              {queue.length === 1
                ? "file"
                : "files"}
            </span>
          </div>
        </div>

        {!queue.length ? (
          <div className="px-3.5 py-8 text-center">
            <FileText
              size={20}
              className="mx-auto text-slate-300"
            />

            <p className="mt-2 text-[9px] font-medium text-slate-500">
              Queue is empty
            </p>

            <p className="mt-1 text-[8px] text-slate-400">
              Select multiple PDFs above to
              create a processing queue.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[28px_1.8fr_0.7fr_0.8fr_90px] border-b border-slate-200 bg-[#fcfcfd] px-3.5 py-2">
              <span className="text-[7px] font-medium uppercase tracking-wide text-slate-400">
                #
              </span>

              <span className="text-[7px] font-medium uppercase tracking-wide text-slate-500">
                Document
              </span>

              <span className="text-[7px] font-medium uppercase tracking-wide text-slate-500">
                Confidence
              </span>

              <span className="text-[7px] font-medium uppercase tracking-wide text-slate-500">
                Status
              </span>

              <span className="text-center text-[7px] font-medium uppercase tracking-wide text-slate-500">
                Order
              </span>
            </div>

            {queue.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-[28px_1.8fr_0.7fr_0.8fr_90px] items-center border-b border-slate-100 px-3.5 py-2.5 last:border-b-0"
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
                  {formatConfidence(
                    item.confidence
                  )}
                </span>

                <div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[7px] font-medium ${
                      item.status === "Processed" ||
                      item.status === "Replaced"
                        ? "bg-[#e8f0ed] text-[#315b50]"
                        : item.status === "Failed" ||
                          item.status === "Duplicate"
                        ? "bg-red-50 text-red-600"
                        : item.status ===
                          "Needs Confirmation"
                        ? "bg-orange-50 text-orange-600"
                        : item.status === "Replacing"
                        ? "bg-purple-50 text-purple-600"
                        : item.status === "Uploading"
                        ? "bg-blue-50 text-blue-600"
                        : item.status === "Extracting"
                        ? "bg-purple-50 text-purple-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {[
                      "Uploading",
                      "Extracting",
                      "Replacing",
                    ].includes(item.status) ? (
                      <Loader2
                        size={8}
                        className="animate-spin"
                      />
                    ) : item.status ===
                        "Processed" ||
                      item.status === "Replaced" ? (
                      <Check size={8} />
                    ) : item.status ===
                        "Duplicate" ||
                      item.status ===
                        "Needs Confirmation" ? (
                      <AlertCircle size={8} />
                    ) : null}

                    {item.status}
                  </span>

                  {item.status === "Failed" && (
                    <button
                      type="button"
                      onClick={() =>
                        retryFailedItem(
                          item.id
                        )
                      }
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
                    disabled={
                      processingQueue ||
                      index === 0
                    }
                    onClick={() =>
                      moveQueueItem(
                        index,
                        "up"
                      )
                    }
                    className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowUp size={11} />
                  </button>

                  <button
                    type="button"
                    title="Move down"
                    disabled={
                      processingQueue ||
                      index ===
                        queue.length - 1
                    }
                    onClick={() =>
                      moveQueueItem(
                        index,
                        "down"
                      )
                    }
                    className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowDown size={11} />
                  </button>

                  <button
                    type="button"
                    title="Remove"
                    disabled={processingQueue}
                    onClick={() =>
                      removeFromQueue(
                        item.id
                      )
                    }
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
                  <b className="text-slate-600">
                    {queuedCount}
                  </b>
                </span>

                <span>
                  Processed:{" "}
                  <b className="text-green-600">
                    {processedCount}
                  </b>
                </span>

                <span>
                  Failed:{" "}
                  <b className="text-red-500">
                    {failedCount}
                  </b>
                </span>
              </div>

              <button
                type="button"
                onClick={processQueue}
                disabled={
                  processingQueue ||
                  queue.length === 0 ||
                  queuedCount === 0
                }
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#003b73] px-4 text-[9px] font-semibold text-white transition hover:bg-[#064b8c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processingQueue ? (
                  <>
                    <Loader2
                      size={12}
                      className="animate-spin"
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play
                      size={11}
                      fill="currentColor"
                    />
                    Process Queue
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </section>

      {result &&
        !processingQueue &&
        status !== "error" && (
          <div className="mt-3 rounded-md border border-green-200 bg-green-50 px-3.5 py-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-green-800">
              <Check size={14} />
              Document processed — #
              {result.document_id}
            </div>

            <p className="mt-1 text-[9px] text-green-700">
              OCR confidence:{" "}
              {formatConfidence(
                result.confidence
              )}
            </p>

            {extraction && (
              <div className="mt-3 border-t border-green-200 pt-3">
                <p className="text-[10px] font-semibold text-[#062f5c]">
                  Type:{" "}
                  {extraction.document
                    ?.doc_type ||
                    "Unclassified"}
                </p>

                {extraction.document?.summary && (
                  <p className="mt-1 text-[9px] text-slate-600">
                    {
                      extraction.document
                        .summary
                    }
                  </p>
                )}

                {extraction.risk
                  ?.has_deadline ? (
                  <p className="mt-1 text-[9px] text-slate-600">
                    Deadline:{" "}
                    {String(
                      extraction.risk
                        .deadline_date
                    )}{" "}
                    · Urgency:{" "}
                    <span className="font-semibold">
                      {
                        extraction.risk
                          .urgency
                      }
                    </span>
                  </p>
                ) : (
                  <p className="mt-1 text-[9px] text-slate-500">
                    No compliance deadline
                    detected.
                  </p>
                )}

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/compliance"
                      )
                    }
                    className="rounded-md border border-[#003b73] px-3 py-1.5 text-[9px] font-semibold text-[#003b73] hover:bg-[#eef4ff]"
                  >
                    View in Compliance
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/documents"
                      )
                    }
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
          {[
            "Document",
            "Uploaded",
            "Size",
            "Confidence",
            "Status",
          ].map((heading) => (
            <span
              key={heading}
              className="text-[7px] font-medium uppercase tracking-wide text-slate-500"
            >
              {heading}
            </span>
          ))}
        </div>

        {uploadedFiles.length === 0 ? (
          <div className="px-3.5 py-6 text-center text-[9px] text-slate-400">
            No documents uploaded this
            session yet.
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

              <span className="text-[8px] text-slate-500">
                {file.date}
              </span>

              <span className="text-[8px] text-slate-500">
                {file.size}
              </span>

              <span
                className={`text-[8px] font-semibold ${
                  file.confidence === null
                    ? "text-slate-400"
                    : Number(file.confidence) <
                      0.7
                    ? "text-orange-600"
                    : "text-green-600"
                }`}
              >
                {formatConfidence(
                  file.confidence
                )}
              </span>

              <span
                className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[7px] font-medium ${
                  file.status === "Processed" ||
                  file.status === "Replaced"
                    ? "bg-[#e8f0ed] text-[#315b50]"
                    : file.status === "Failed" ||
                      file.status === "Duplicate"
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

      {confirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-[430px] rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  confirmation.type ===
                  "duplicate"
                    ? "bg-orange-50"
                    : "bg-blue-50"
                }`}
              >
                {confirmation.type ===
                "duplicate" ? (
                  <AlertCircle
                    size={19}
                    className="text-orange-500"
                  />
                ) : (
                  <RefreshCw
                    size={19}
                    className="text-blue-500"
                  />
                )}
              </div>

              <div className="min-w-0">
                <h3 className="text-[13px] font-bold text-[#062f5c]">
                  {confirmation.type ===
                  "duplicate"
                    ? "Document Already Exists"
                    : "Existing Document Found"}
                </h3>

                <p className="mt-1 text-[9px] leading-relaxed text-slate-500">
                  {confirmation.message}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  confirmation.type ===
                  "duplicate"
                    ? () =>
                        setConfirmation(
                          null
                        )
                    : handleCancelReplacement
                }
                disabled={
                  confirmation.replacing
                }
                className="ml-auto shrink-0 text-slate-400 transition hover:text-slate-600 disabled:opacity-40"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
              <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">
                Uploaded file
              </p>

              <p className="mt-1 truncate text-[10px] font-semibold text-[#173a61]">
                {confirmation.name}
              </p>
            </div>

            {confirmation.type ===
              "replacement" && (
              <>
                <div className="mt-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2.5">
                  <p className="text-[8px] font-medium uppercase tracking-wide text-blue-500">
                    Existing document
                  </p>

                  <p className="mt-1 truncate text-[10px] font-semibold text-blue-800">
                    {confirmation.existingFilename ||
                      "Existing document"}
                  </p>

                  {confirmation.referenceNumber && (
                    <p className="mt-1 text-[8px] text-blue-600">
                      Reference:{" "}
                      <span className="font-semibold">
                        {
                          confirmation.referenceNumber
                        }
                      </span>
                    </p>
                  )}
                </div>

                <p className="mt-3 text-[9px] leading-relaxed text-slate-500">
                  This appears to be a newer
                  version of an existing
                  document. Do you want to
                  replace the existing
                  document?
                </p>
              </>
            )}

            {confirmation.type ===
              "duplicate" && (
              <p className="mt-3 text-[9px] leading-relaxed text-slate-500">
                This exact PDF is already
                present in the system. It will
                not be uploaded again.
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              {confirmation.type ===
              "duplicate" ? (
                <label
                  htmlFor="different-file"
                  className="inline-flex cursor-pointer items-center rounded-md bg-[#003b73] px-3 py-2 text-[9px] font-semibold text-white transition hover:bg-[#064b8c]"
                >
                  <input
                    id="different-file"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={
                      handleDifferentFile
                    }
                  />
                  Choose Different File
                </label>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={
                      handleCancelReplacement
                    }
                    disabled={
                      confirmation.replacing
                    }
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-[9px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleReplace
                    }
                    disabled={
                      confirmation.replacing
                    }
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#003b73] px-3 py-2 text-[9px] font-semibold text-white transition hover:bg-[#064b8c] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {confirmation.replacing ? (
                      <>
                        <Loader2
                          size={11}
                          className="animate-spin"
                        />
                        Replacing...
                      </>
                    ) : (
                      <>
                        <RefreshCw
                          size={11}
                        />
                        Replace Existing
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Upload;