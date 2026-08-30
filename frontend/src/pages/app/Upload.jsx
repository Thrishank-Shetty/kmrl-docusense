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

// ============================================================
// HELPERS
// ============================================================

const formatConfidence = (value) => {
  const confidence = Number(value);

  if (!Number.isFinite(confidence)) {
    return "N/A";
  }

  return `${(confidence * 100).toFixed(1)}%`;
};

const getConfidenceNumber = (value) => {
  const confidence = Number(value);

  return Number.isFinite(confidence)
    ? confidence
    : null;
};

const getErrorMessage = (
  error,
  fallback = "Something went wrong."
) => {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map(
        (item) =>
          item?.msg || "Validation error"
      )
      .join(", ");
  }

  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

// ============================================================
// COMPONENT
// ============================================================

function Upload() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [extraction, setExtraction] = useState(null);

  const [uploadedFiles, setUploadedFiles] =
    useState([]);

  const [queue, setQueue] = useState([]);

  const [processingQueue, setProcessingQueue] =
    useState(false);

  const [confirmation, setConfirmation] =
    useState(null);

  // ==========================================================
  // QUEUE HELPERS
  // ==========================================================

  const updateQueueItem = (id, changes) => {
    setQueue((currentQueue) =>
      currentQueue.map((item) =>
        item.id === id
          ? {
              ...item,
              ...changes,
            }
          : item
      )
    );
  };

  // ==========================================================
  // FILE SELECTION
  // ==========================================================

  const handleFileChange = (event) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) {
      return;
    }

    const invalidFiles = files.filter(
      (file) =>
        !file.name
          .toLowerCase()
          .endsWith(".pdf")
    );

    if (invalidFiles.length) {
      setError(
        "Only PDF files are supported right now."
      );

      setStatus("error");

      event.target.value = "";

      return;
    }

    setError(null);
    setStatus("idle");

    const timestamp = Date.now();

    const newItems = files.map(
      (file, index) => ({
        id: `${file.name}-${file.lastModified}-${timestamp}-${index}`,

        file,

        name: file.name,

        size: `${(
          file.size /
          (1024 * 1024)
        ).toFixed(1)} MB`,

        status: "Queued",

        document_id: null,

        confidence: null,

        error: null,

        duplicate: false,

        newer_version: false,

        existing_document_id: null,

        existing_filename: null,

        reference_number: null,
      })
    );

    setQueue((currentQueue) => [
      ...currentQueue,
      ...newItems,
    ]);

    showToast(
      `${files.length} ${
        files.length === 1
          ? "file"
          : "files"
      } added to queue`
    );

    event.target.value = "";
  };

  // ==========================================================
  // CHOOSE DIFFERENT FILE
  // ==========================================================

  const handleDifferentFile = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      setError(
        "Only PDF files are supported right now."
      );

      setStatus("error");

      event.target.value = "";

      return;
    }

    const queueId =
      confirmation?.queueId;

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

              size: `${(
                file.size /
                (1024 * 1024)
              ).toFixed(1)} MB`,

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

    showToast(
      "Different file added to queue"
    );

    event.target.value = "";
  };

  // ==========================================================
  // QUEUE ACTIONS
  // ==========================================================

  const removeFromQueue = (id) => {
    if (processingQueue) {
      return;
    }

    setQueue((currentQueue) =>
      currentQueue.filter(
        (item) => item.id !== id
      )
    );
  };

  const moveQueueItem = (
    index,
    direction
  ) => {
    if (processingQueue) {
      return;
    }

    setQueue((currentQueue) => {
      const updatedQueue = [
        ...currentQueue,
      ];

      const targetIndex =
        direction === "up"
          ? index - 1
          : index + 1;

      if (
        targetIndex < 0 ||
        targetIndex >=
          updatedQueue.length
      ) {
        return currentQueue;
      }

      [
        updatedQueue[index],
        updatedQueue[targetIndex],
      ] = [
        updatedQueue[targetIndex],
        updatedQueue[index],
      ];

      return updatedQueue;
    });
  };

  // ==========================================================
  // RECENT UPLOAD
  // ==========================================================

  const addRecentUpload = (
    item,
    documentId,
    confidence,
    uploadStatus = "Uploaded"
  ) => {
    setUploadedFiles(
      (currentFiles) => [
        {
          name: item.name,

          size: item.size,

          date: new Date().toLocaleString(),

          document_id: documentId,

          status: uploadStatus,

          confidence,
        },

        ...currentFiles,
      ]
    );
  };

  // ==========================================================
  // EXTRACTION
  // ==========================================================

  const runExtraction = async (
    item,
    documentId
  ) => {
    updateQueueItem(item.id, {
      status: "Extracting",
      error: null,
    });

    setStatus("extracting");

    try {
      const response =
        await extractDocument(
          documentId
        );

      const extracted = response.data;

      setExtraction(extracted);

      const extractedConfidence =
        getConfidenceNumber(
          extracted?.document
            ?.extraction_confidence ??
            extracted?.extraction_confidence ??
            extracted?.confidence
        );

      updateQueueItem(item.id, {
        status: "Processed",
        confidence:
          extractedConfidence,
        error: null,
      });

      setUploadedFiles(
        (currentFiles) =>
          currentFiles.map(
            (file) =>
              file.document_id ===
              documentId
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

      const message =
        getErrorMessage(
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

  // ==========================================================
  // PROCESS UPLOAD RESULT
  // ==========================================================

  const processUploadResult = async (
    item,
    uploadResult
  ) => {
    const documentId =
      uploadResult?.document_id;

    if (!documentId) {
      updateQueueItem(item.id, {
        status: "Failed",

        error:
          "Backend did not return a document ID.",
      });

      return;
    }

    const confidence =
      getConfidenceNumber(
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

    await runExtraction(
      item,
      documentId
    );
  };

  // ==========================================================
  // BULK RESPONSE
  // ==========================================================

  const handleBulkResponse = async (
    response,
    itemsToUpload
  ) => {
    const data = response?.data;

    const results = Array.isArray(
      data?.results
    )
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

      const item =
        itemsToUpload[index];

      if (!item) {
        console.warn(
          "Received an upload result without a matching queue item:",
          result
        );

        continue;
      }

      // ------------------------------------------------------
      // EXACT DUPLICATE
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // NEWER VERSION
      // ------------------------------------------------------

      if (
        result?.newer_version ===
          true ||
        result?.requires_confirmation ===
          true
      ) {
        updateQueueItem(item.id, {
          status:
            "Needs Confirmation",

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

      // ------------------------------------------------------
      // NORMAL UPLOAD
      // ------------------------------------------------------

      await processUploadResult(
        item,
        result
      );
    }
  };

  // ==========================================================
  // PROCESS QUEUE
  // ==========================================================

  const processQueue = async () => {
    if (
      processingQueue ||
      !queue.length
    ) {
      return;
    }

    const itemsToUpload =
      queue.filter(
        (item) =>
          item.status === "Queued" ||
          item.status === "Failed"
      );

    if (!itemsToUpload.length) {
      return;
    }

    setProcessingQueue(true);

    setStatus("uploading");

    setError(null);

    itemsToUpload.forEach(
      (item) =>
        updateQueueItem(item.id, {
          status: "Uploading",
          error: null,
        })
    );

    try {
      const files =
        itemsToUpload.map(
          (item) => item.file
        );

      const response =
        await uploadDocument(files);

      await handleBulkResponse(
        response,
        itemsToUpload
      );

      setStatus("done");

      showToast(
        "Queue processing completed"
      );
    } catch (error) {
      console.error(
        "Bulk upload failed:",
        error
      );

      const message =
        getErrorMessage(
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

  // ==========================================================
  // REPLACE DOCUMENT
  // ==========================================================

  const handleReplace = async () => {
    if (
      !confirmation ||
      confirmation.type !==
        "replacement"
    ) {
      return;
    }

    const queueItem =
      queue.find(
        (item) =>
          item.id ===
          confirmation.queueId
      );

    if (!queueItem) {
      setConfirmation(null);
      return;
    }

    if (
      !confirmation.existingDocumentId
    ) {
      setError(
        "The backend did not provide the existing document ID required for replacement."
      );

      setConfirmation(null);

      return;
    }

    setConfirmation((current) =>
      current
        ? {
            ...current,
            replacing: true,
          }
        : current
    );

    updateQueueItem(
      queueItem.id,
      {
        status: "Replacing",
        error: null,
      }
    );

    try {
      const response =
        await replaceDocument(
          confirmation.existingDocumentId,
          queueItem.file
        );

      const replacement =
        response?.data;

      const documentId =
        replacement?.document_id ||
        confirmation.existingDocumentId;

      const confidence =
        getConfidenceNumber(
          replacement?.confidence
        );

      updateQueueItem(
        queueItem.id,
        {
          status: "Replaced",

          document_id: documentId,

          confidence,

          error: null,
        }
      );

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

      const message =
        getErrorMessage(
          error,
          "Unable to replace the existing document."
        );

      updateQueueItem(
        queueItem.id,
        {
          status: "Failed",
          error: message,
        }
      );

      setConfirmation(null);

      setStatus("error");

      setError(message);
    }
  };

  // ==========================================================
  // CANCEL REPLACEMENT
  // ==========================================================

  const handleCancelReplacement =
    () => {
      if (!confirmation) {
        return;
      }

      if (
        confirmation.type ===
        "replacement"
      ) {
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

  // ==========================================================
  // CLEAR COMPLETED
  // ==========================================================

  const clearCompleted = () => {
    if (processingQueue) {
      return;
    }

    setQueue((currentQueue) =>
      currentQueue.filter(
        (item) =>
          item.status !== "Processed" &&
          item.status !== "Replaced" &&
          item.status !== "Duplicate"
      )
    );
  };

  // ==========================================================
  // RETRY
  // ==========================================================

  const retryFailedItem = (id) => {
    if (processingQueue) {
      return;
    }

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

  // ==========================================================
  // COUNTS
  // ==========================================================

  const queuedCount = queue.filter(
    (item) =>
      item.status === "Queued"
  ).length;

  const processedCount =
    queue.filter(
      (item) =>
        item.status ===
          "Processed" ||
        item.status === "Replaced"
    ).length;

  const failedCount = queue.filter(
    (item) =>
      item.status === "Failed" ||
      item.status === "Duplicate"
  ).length;

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-full bg-[#FAFBFF] px-5 py-5">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="mb-4">
        <h1 className="text-[24px] font-bold leading-tight text-[#061F3D]">
          Upload & Analyze Documents
        </h1>

        <p className="mt-1 text-[12px] text-slate-500">
          Upload KMRL documents and process
          them through OCR and AI extraction.
        </p>
      </div>

      {/* ======================================================
          UPLOAD AREA
      ====================================================== */}

      <label
        htmlFor="document-upload"
        className={`group flex h-[190px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white transition hover:border-[#568FE8] hover:bg-[#FCFDFF] ${
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

        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF4FF]">
          {processingQueue ? (
            <Loader2
              size={23}
              strokeWidth={1.8}
              className="animate-spin text-[#0056A6]"
            />
          ) : (
            <UploadCloud
              size={23}
              strokeWidth={1.8}
              className="text-[#0056A6]"
            />
          )}
        </div>

        <h2 className="text-[15px] font-semibold text-[#062F5C]">
          {processingQueue
            ? "Processing queue..."
            : "Upload your documents"}
        </h2>

        <p className="mt-1 text-[11px] text-slate-500">
          Select one or multiple PDF files
        </p>

        <span className="mt-4 rounded-md bg-[#003B73] px-6 py-2.5 text-[11px] font-semibold text-white shadow-sm transition group-hover:bg-[#064B8C]">
          Browse Files
        </span>

        <p className="mt-2.5 text-[9px] text-slate-400">
          PDF only
        </p>
      </label>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {status === "error" &&
        error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[11px] text-red-700">
            <AlertCircle size={15} />

            {error}
          </div>
        )}

      {/* ======================================================
          PROCESSING QUEUE
      ====================================================== */}

      <section className="mt-4 overflow-hidden rounded-xl border border-[#D9E2EF] bg-white shadow-sm">

        {/* QUEUE HEADER */}

        <div className="flex min-h-[58px] items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFD] px-5">

          <div>
            <h2 className="text-[15px] font-bold text-[#062F5C]">
              Processing Queue
            </h2>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Files are processed from top
              to bottom
            </p>
          </div>

          <div className="flex items-center gap-4">

            {queue.length > 0 && (
              <button
                type="button"
                onClick={clearCompleted}
                disabled={
                  processingQueue ||
                  processedCount === 0
                }
                className="text-[11px] font-semibold text-slate-400 transition hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear completed
              </button>
            )}

            <span className="rounded-full bg-[#EAF2FF] px-3 py-1 text-[10px] font-bold text-[#0056A6]">
              {queue.length}{" "}
              {queue.length === 1
                ? "file"
                : "files"}
            </span>

          </div>
        </div>

        {!queue.length ? (

          /* EMPTY QUEUE */

          <div className="flex min-h-[135px] flex-col items-center justify-center px-5 py-6 text-center">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F5F9]">
              <FileText
                size={19}
                strokeWidth={1.8}
                className="text-[#B8C7D9]"
              />
            </div>

            <p className="mt-3 text-[13px] font-semibold text-slate-500">
              Queue is empty
            </p>

            <p className="mt-1 text-[11px] text-slate-400">
              Select one or more PDFs above
              to create a processing queue.
            </p>

          </div>

        ) : (

          <>

            {/* TABLE HEADER */}

            <div className="grid grid-cols-[35px_minmax(220px,1.8fr)_0.7fr_0.9fr_110px] items-center border-b border-slate-200 bg-[#FCFDFE] px-5 py-3">

              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                #
              </span>

              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Document
              </span>

              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Confidence
              </span>

              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Status
              </span>

              <span className="text-center text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Order
              </span>

            </div>

            {/* QUEUE ITEMS */}

            {queue.map(
              (item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[35px_minmax(220px,1.8fr)_0.7fr_0.9fr_110px] items-center border-b border-slate-100 px-5 py-3 last:border-b-0"
                >

                  {/* NUMBER */}

                  <span className="text-[11px] font-semibold text-slate-400">
                    {index + 1}
                  </span>

                  {/* DOCUMENT */}

                  <div className="flex min-w-0 items-center gap-3">

                    <GripVertical
                      size={15}
                      className="shrink-0 text-slate-300"
                    />

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-red-50">
                      <FileText
                        size={16}
                        className="text-red-500"
                      />
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-[12px] font-semibold text-[#173A61]">
                        {item.name}
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {item.size}
                      </p>

                      {item.error && (
                        <p className="mt-1 truncate text-[10px] text-red-500">
                          {item.error}
                        </p>
                      )}

                    </div>
                  </div>

                  {/* CONFIDENCE */}

                  <span
                    className={`text-[11px] font-bold ${
                      item.confidence ===
                      null
                        ? "text-slate-400"
                        : Number(
                            item.confidence
                          ) < 0.7
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {formatConfidence(
                      item.confidence
                    )}
                  </span>

                  {/* STATUS */}

                  <div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        item.status ===
                          "Processed" ||
                        item.status ===
                          "Replaced"
                          ? "bg-[#E8F5EE] text-[#28735B]"
                          : item.status ===
                                "Failed" ||
                            item.status ===
                              "Duplicate"
                          ? "bg-red-50 text-red-600"
                          : item.status ===
                            "Needs Confirmation"
                          ? "bg-orange-50 text-orange-600"
                          : item.status ===
                            "Replacing"
                          ? "bg-purple-50 text-purple-600"
                          : item.status ===
                            "Uploading"
                          ? "bg-blue-50 text-blue-600"
                          : item.status ===
                            "Extracting"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >

                      {[
                        "Uploading",
                        "Extracting",
                        "Replacing",
                      ].includes(
                        item.status
                      ) ? (
                        <Loader2
                          size={10}
                          className="animate-spin"
                        />
                      ) : item.status ===
                          "Processed" ||
                        item.status ===
                          "Replaced" ? (
                        <Check size={10} />
                      ) : item.status ===
                          "Duplicate" ||
                        item.status ===
                          "Needs Confirmation" ? (
                        <AlertCircle
                          size={10}
                        />
                      ) : null}

                      {item.status}

                    </span>

                    {item.status ===
                      "Failed" && (
                      <button
                        type="button"
                        onClick={() =>
                          retryFailedItem(
                            item.id
                          )
                        }
                        disabled={
                          processingQueue
                        }
                        className="ml-2 text-[10px] font-bold text-red-500 hover:text-red-700"
                      >
                        Retry
                      </button>
                    )}

                  </div>

                  {/* ORDER */}

                  <div className="flex items-center justify-center gap-1.5">

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
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ArrowUp
                        size={12}
                      />
                    </button>

                    <button
                      type="button"
                      title="Move down"
                      disabled={
                        processingQueue ||
                        index ===
                          queue.length -
                            1
                      }
                      onClick={() =>
                        moveQueueItem(
                          index,
                          "down"
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ArrowDown
                        size={12}
                      />
                    </button>

                    <button
                      type="button"
                      title="Remove"
                      disabled={
                        processingQueue
                      }
                      onClick={() =>
                        removeFromQueue(
                          item.id
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <X size={12} />
                    </button>

                  </div>

                </div>
              )
            )}

            {/* QUEUE FOOTER */}

            <div className="flex min-h-[55px] items-center justify-between border-t border-slate-200 bg-[#F8FAFD] px-5">

              <div className="flex items-center gap-5 text-[11px]">

                <span className="text-slate-500">
                  Queued:{" "}
                  <b className="text-slate-700">
                    {queuedCount}
                  </b>
                </span>

                <span className="text-slate-500">
                  Processed:{" "}
                  <b className="text-green-600">
                    {processedCount}
                  </b>
                </span>

                <span className="text-slate-500">
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
                className="inline-flex h-9 items-center gap-2 rounded-md bg-[#003B73] px-5 text-[11px] font-bold text-white transition hover:bg-[#064B8C] disabled:cursor-not-allowed disabled:opacity-50"
              >

                {processingQueue ? (
                  <>
                    <Loader2
                      size={13}
                      className="animate-spin"
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play
                      size={12}
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

      {/* ======================================================
          RESULT / EXTRACTION
      ====================================================== */}

      {result &&
        !processingQueue &&
        status !== "error" && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-5 py-4">

            <div className="flex items-center gap-2 text-[13px] font-semibold text-green-800">

              <Check size={16} />

              Document processed — #
              {result.document_id}

            </div>

            <p className="mt-1 text-[11px] text-green-700">
              OCR confidence:{" "}
              {formatConfidence(
                result.confidence
              )}
            </p>

            {extraction && (
              <div className="mt-4 border-t border-green-200 pt-4">

                <p className="text-[12px] font-semibold text-[#062F5C]">
                  Type:{" "}
                  {extraction.document
                    ?.doc_type ||
                    "Unclassified"}
                </p>

                {extraction.document
                  ?.summary && (
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                    {
                      extraction
                        .document
                        .summary
                    }
                  </p>
                )}

                {extraction.risk
                  ?.has_deadline ? (
                  <p className="mt-1 text-[11px] text-slate-600">
                    Deadline:{" "}
                    {String(
                      extraction
                        .risk
                        .deadline_date
                    )}{" "}
                    · Urgency:{" "}
                    <span className="font-semibold">
                      {
                        extraction
                          .risk
                          .urgency
                      }
                    </span>
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-500">
                    No compliance deadline
                    detected.
                  </p>
                )}

                <div className="mt-3 flex gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/compliance"
                      )
                    }
                    className="rounded-md border border-[#003B73] px-4 py-2 text-[10px] font-semibold text-[#003B73] hover:bg-[#EEF4FF]"
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
                    className="rounded-md border border-[#003B73] px-4 py-2 text-[10px] font-semibold text-[#003B73] hover:bg-[#EEF4FF]"
                  >
                    View in Documents
                  </button>

                </div>

              </div>
            )}

          </div>
        )}

      {/* ======================================================
          RECENT UPLOADS
      ====================================================== */}

      <section className="mt-4 overflow-hidden rounded-xl border border-[#D9E2EF] bg-white shadow-sm">

        {/* HEADER */}

        <div className="flex min-h-[58px] items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFD] px-5">

          <div>
            <h2 className="text-[15px] font-bold text-[#062F5C]">
              Recent Uploads
            </h2>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Documents uploaded during
              this session
            </p>
          </div>

          {uploadedFiles.length >
            0 && (
            <span className="rounded-full bg-[#EAF2FF] px-3 py-1 text-[10px] font-bold text-[#0056A6]">
              {uploadedFiles.length}{" "}
              {uploadedFiles.length ===
              1
                ? "document"
                : "documents"}
            </span>
          )}

        </div>

        {/* TABLE HEADER */}

        <div className="grid grid-cols-[1.7fr_1fr_0.7fr_0.8fr_0.7fr] border-b border-slate-200 bg-[#FCFDFE] px-5 py-3">

          {[
            "Document",
            "Uploaded",
            "Size",
            "Confidence",
            "Status",
          ].map((heading) => (
            <span
              key={heading}
              className="text-[10px] font-bold uppercase tracking-wide text-slate-500"
            >
              {heading}
            </span>
          ))}

        </div>

        {/* EMPTY STATE */}

        {uploadedFiles.length ===
        0 ? (
          <div className="flex min-h-[105px] items-center justify-center px-5">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F5F9]">
                <UploadCloud
                  size={17}
                  className="text-[#A8B8CB]"
                />
              </div>

              <div>

                <p className="text-[12px] font-semibold text-slate-500">
                  No documents uploaded
                  yet
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Uploaded documents will
                  appear here.
                </p>

              </div>

            </div>

          </div>
        ) : (
          uploadedFiles.map(
            (file) => (
              <div
                key={
                  file.document_id
                }
                className="grid min-h-[58px] grid-cols-[1.7fr_1fr_0.7fr_0.8fr_0.7fr] items-center border-b border-slate-100 px-5 last:border-b-0 hover:bg-[#FAFCFF]"
              >

                {/* DOCUMENT */}

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-red-50">
                    <FileText
                      size={16}
                      className="text-red-500"
                    />
                  </div>

                  <span className="truncate text-[11px] font-semibold text-[#173A61]">
                    {file.name}
                  </span>

                </div>

                {/* UPLOADED */}

                <span className="text-[10px] text-slate-500">
                  {file.date}
                </span>

                {/* SIZE */}

                <span className="text-[10px] text-slate-500">
                  {file.size}
                </span>

                {/* CONFIDENCE */}

                <span
                  className={`text-[10px] font-bold ${
                    file.confidence ===
                    null
                      ? "text-slate-400"
                      : Number(
                          file.confidence
                        ) < 0.7
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  {formatConfidence(
                    file.confidence
                  )}
                </span>

                {/* STATUS */}

                <span
                  className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[9px] font-semibold ${
                    file.status ===
                        "Processed" ||
                      file.status ===
                        "Replaced"
                      ? "bg-[#E8F5EE] text-[#28735B]"
                      : file.status ===
                            "Failed" ||
                        file.status ===
                          "Duplicate"
                      ? "bg-red-50 text-red-600"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {file.status}
                </span>

              </div>
            )
          )
        )}

      </section>

      {/* ======================================================
          CONFIRMATION MODAL
      ====================================================== */}

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

                <h3 className="text-[14px] font-bold text-[#062F5C]">
                  {confirmation.type ===
                  "duplicate"
                    ? "Document Already Exists"
                    : "Existing Document Found"}
                </h3>

                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                  {
                    confirmation.message
                  }
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

            {/* UPLOADED FILE */}

            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">

              <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
                Uploaded file
              </p>

              <p className="mt-1 truncate text-[11px] font-semibold text-[#173A61]">
                {confirmation.name}
              </p>

            </div>

            {/* EXISTING DOCUMENT */}

            {confirmation.type ===
              "replacement" && (
              <>

                <div className="mt-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2.5">

                  <p className="text-[9px] font-medium uppercase tracking-wide text-blue-500">
                    Existing document
                  </p>

                  <p className="mt-1 truncate text-[11px] font-semibold text-blue-800">
                    {confirmation.existingFilename ||
                      "Existing document"}
                  </p>

                  {confirmation.referenceNumber && (
                    <p className="mt-1 text-[9px] text-blue-600">
                      Reference:{" "}
                      <span className="font-semibold">
                        {
                          confirmation.referenceNumber
                        }
                      </span>
                    </p>
                  )}

                </div>

                <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
                  This appears to be a newer
                  version of an existing
                  document. Do you want to
                  replace the existing
                  document?
                </p>

              </>
            )}

            {/* DUPLICATE MESSAGE */}

            {confirmation.type ===
              "duplicate" && (
              <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
                This exact PDF is already
                present in the system. It will
                not be uploaded again.
              </p>
            )}

            {/* MODAL ACTIONS */}

            <div className="mt-5 flex justify-end gap-2">

              {confirmation.type ===
              "duplicate" ? (

                <label
                  htmlFor="different-file"
                  className="inline-flex cursor-pointer items-center rounded-md bg-[#003B73] px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-[#064B8C]"
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
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#003B73] px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-[#064B8C] disabled:cursor-not-allowed disabled:opacity-50"
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