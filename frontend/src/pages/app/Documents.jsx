import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  UploadCloud,
  Search,
  SlidersHorizontal,
  X,
  Bot,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getAllDocuments,
  getDocumentCompliance,
} from "../../lib/api";
import { useToast } from "../../components/common/useToast";

const PAGE_SIZE = 10;

export default function Documents() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const [expandedId, setExpandedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // -------------------------
  // Helpers
  // -------------------------

  const getStatus = (doc) => {
    if (doc.status) return doc.status.toLowerCase();
    if (doc.doc_type) return "processed";
    return "pending";
  };

  const getConfidence = (doc) => {
    const value = parseFloat(doc.extraction_confidence);
    return Number.isNaN(value) ? null : value;
  };

  const getDocumentType = (doc) => doc.doc_type || "Unknown";

  // -------------------------
  // Load documents
  // -------------------------

  const loadDocuments = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const res = await getAllDocuments();
        setDocuments(res.data || []);

        if (isRefresh) {
          showToast("Documents refreshed");
        }
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.detail ||
            "Failed to load documents. Is the backend running?"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    let cancelled = false;

    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getAllDocuments();

        if (!cancelled) {
          setDocuments(res.data || []);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
              "Failed to load documents. Is the backend running?"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDocuments();

    return () => {
      cancelled = true;
    };
  }, []);

  // -------------------------
  // Document types
  // -------------------------

  const documentTypes = useMemo(() => {
    const types = documents
      .map((doc) => getDocumentType(doc))
      .filter((type) => type !== "Unknown");

    return ["all", ...new Set(types)];
  }, [documents]);

  // -------------------------
  // Filter + search + sort
  // -------------------------

  const filteredDocuments = useMemo(() => {
    let result = [...documents];

    if (search.trim()) {
      const query = search.toLowerCase().trim();

      result = result.filter((doc) => {
        const filename = doc.filename?.toLowerCase() || "";
        const type = doc.doc_type?.toLowerCase() || "";
        const reference =
          doc.reference_number?.toLowerCase() || "";
        const department =
          doc.department?.toLowerCase() || "";

        return (
          filename.includes(query) ||
          type.includes(query) ||
          reference.includes(query) ||
          department.includes(query)
        );
      });
    }

    if (typeFilter !== "all") {
      result = result.filter(
        (doc) => getDocumentType(doc) === typeFilter
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (doc) => getStatus(doc) === statusFilter
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.upload_date || 0) -
            new Date(b.upload_date || 0)
          );

        case "nameAsc":
          return (a.filename || "").localeCompare(
            b.filename || ""
          );

        case "nameDesc":
          return (b.filename || "").localeCompare(
            a.filename || ""
          );

        case "confidenceHigh":
          return (
            (getConfidence(b) ?? -1) -
            (getConfidence(a) ?? -1)
          );

        case "confidenceLow":
          return (
            (getConfidence(a) ?? Infinity) -
            (getConfidence(b) ?? Infinity)
          );

        case "newest":
        default:
          return (
            new Date(b.upload_date || 0) -
            new Date(a.upload_date || 0)
          );
      }
    });

    return result;
  }, [
    documents,
    search,
    typeFilter,
    statusFilter,
    sortBy,
  ]);

  // -------------------------
  // Pagination
  // -------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDocuments.length / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedDocuments = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;

    return filteredDocuments.slice(
      start,
      start + PAGE_SIZE
    );
  }, [filteredDocuments, safePage]);

  // -------------------------
  // Clear filters
  // -------------------------

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const hasFilters =
    search.trim() ||
    typeFilter !== "all" ||
    statusFilter !== "all" ||
    sortBy !== "newest";

  // -------------------------
  // Expand document
  // -------------------------

  const toggleRow = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      setDetailError(null);
      return;
    }

    setExpandedId(id);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);

    try {
      const res = await getDocumentCompliance(id);
      setDetail(res.data);
    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.detail ||
        "Failed to load compliance details.";

      setDetailError(message);
      showToast(message, "error");
    } finally {
      setDetailLoading(false);
    }
  };

  // -------------------------
  // Open document in AI Search
  // -------------------------

  const openInAiSearch = (e, documentId) => {
    e.stopPropagation();
    navigate(`/ai-search?documentId=${documentId}`);
  };

  // -------------------------
  // Loading state
  // -------------------------

  if (loading) {
    return (
      <div className="min-h-full bg-[#fafbff] px-5 py-5">
        <div className="mb-4">
          <div className="h-7 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-64 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="mb-3 h-14 animate-pulse rounded-md border border-slate-200 bg-white" />

        <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="h-9 animate-pulse border-b bg-slate-50" />

          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[1.6fr_1fr_1fr_0.8fr_0.35fr] gap-4 border-b px-3.5 py-3 last:border-b-0"
            >
              <div className="h-3 w-40 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-14 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-5 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------
  // Error state
  // -------------------------

  if (error) {
    return (
      <div className="min-h-full bg-[#fafbff] px-5 py-5">
        <h1 className="text-[24px] font-bold leading-tight text-[#061f3d]">
          Documents
        </h1>

        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={17}
              className="mt-0.5 shrink-0 text-red-500"
            />

            <div>
              <p className="text-[11px] font-semibold text-red-800">
                Unable to load documents
              </p>

              <p className="mt-1 text-[10px] text-red-700">
                {error}
              </p>

              <button
                onClick={() => loadDocuments()}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-[9px] font-semibold text-white transition hover:bg-red-700"
              >
                <RefreshCw size={12} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#fafbff] px-5 py-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold leading-tight text-[#061f3d]">
            Documents
          </h1>

          <p className="mt-1 text-[11px] text-slate-500">
            All documents processed by the system.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadDocuments(true)}
            disabled={refreshing}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[9px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={13}
              className={refreshing ? "animate-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            onClick={() => navigate("/upload")}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#003b73] px-3 text-[9px] font-semibold text-white transition hover:bg-[#064b8c]"
          >
            <UploadCloud size={13} />
            Upload
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mt-4 rounded-md border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search documents..."
              className="h-8 w-full rounded-md border border-slate-200 bg-[#fafbff] pl-9 pr-8 text-[9px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0056a6]"
            />

            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Type */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 min-w-[120px] appearance-none rounded-md border border-slate-200 bg-white px-3 pr-7 text-[9px] text-slate-600 outline-none focus:border-[#0056a6]"
            >
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All Types" : type}
                </option>
              ))}
            </select>

            <ChevronDown
              size={12}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          {/* Status */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 min-w-[120px] appearance-none rounded-md border border-slate-200 bg-white px-3 pr-7 text-[9px] capitalize text-slate-600 outline-none focus:border-[#0056a6]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="processed">Processed</option>
              <option value="failed">Failed</option>
              <option value="review_required">
                Review Required
              </option>
            </select>

            <ChevronDown
              size={12}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 min-w-[145px] appearance-none rounded-md border border-slate-200 bg-white px-3 pr-7 text-[9px] text-slate-600 outline-none focus:border-[#0056a6]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="nameAsc">Name A–Z</option>
              <option value="nameDesc">Name Z–A</option>
              <option value="confidenceHigh">
                Highest Confidence
              </option>
              <option value="confidenceLow">
                Lowest Confidence
              </option>
            </select>

            <ChevronDown
              size={12}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[9px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-[8px] text-slate-400">
          <SlidersHorizontal size={11} />

          Showing {filteredDocuments.length} of{" "}
          {documents.length} documents
        </div>
      </div>

      {/* Table */}
      <section className="mt-3 overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="grid grid-cols-[1.6fr_1fr_1fr_0.8fr_0.35fr] border-b border-slate-200 bg-[#fcfcfd] px-3.5 py-2">
          <span className="text-[7px] font-medium uppercase tracking-wide text-slate-500">
            Filename
          </span>

          <span className="text-[7px] font-medium uppercase tracking-wide text-slate-500">
            Type
          </span>

          <span className="text-[7px] font-medium uppercase tracking-wide text-slate-500">
            Uploaded
          </span>

          <span className="text-[7px] font-medium uppercase tracking-wide text-slate-500">
            Status
          </span>

          <span className="text-center text-[7px] font-medium uppercase tracking-wide text-slate-500">
            AI
          </span>
        </div>

        {/* No results */}
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              {documents.length === 0 ? (
                <FileText
                  size={21}
                  className="text-slate-400"
                />
              ) : (
                <Search
                  size={21}
                  className="text-slate-400"
                />
              )}
            </div>

            <p className="mt-3 text-[11px] font-semibold text-slate-700">
              {documents.length === 0
                ? "No documents yet"
                : "No matching documents"}
            </p>

            <p className="mt-1 max-w-[280px] text-[9px] leading-relaxed text-slate-400">
              {documents.length === 0
                ? "Upload your first KMRL document to start extracting and analyzing information."
                : "Try changing your search or filters."}
            </p>

            {documents.length === 0 ? (
              <button
                onClick={() => navigate("/upload")}
                className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[#003b73] px-4 py-2 text-[9px] font-semibold text-white transition hover:bg-[#064b8c]"
              >
                <UploadCloud size={13} />
                Upload Document
              </button>
            ) : (
              hasFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              )
            )}
          </div>
        ) : (
          paginatedDocuments.map((doc) => {
            const uploadedDate = doc.upload_date
              ? new Date(doc.upload_date)
              : null;

            const validDate =
              uploadedDate &&
              !Number.isNaN(uploadedDate.getTime());

            const status = getStatus(doc);

            return (
              <div
                key={doc.id}
                className="border-b border-slate-200 last:border-b-0"
              >
                <div className="grid grid-cols-[1.6fr_1fr_1fr_0.8fr_0.35fr] items-center px-3.5 py-2.5">
                  {/* Filename */}
                  <button
                    onClick={() => toggleRow(doc.id)}
                    className="flex min-w-0 items-center gap-2 text-left transition hover:bg-[#fafbff]"
                  >
                    {expandedId === doc.id ? (
                      <ChevronUp
                        size={12}
                        className="shrink-0 text-slate-400"
                      />
                    ) : (
                      <ChevronDown
                        size={12}
                        className="shrink-0 text-slate-400"
                      />
                    )}

                    <FileText
                      size={14}
                      className="shrink-0 text-red-500"
                    />

                    <span className="truncate text-[9px] font-medium text-[#173a61]">
                      {doc.filename || "Unnamed document"}
                    </span>
                  </button>

                  {/* Type */}
                  <span className="truncate text-[8px] text-slate-500">
                    {doc.doc_type || "Unknown"}
                  </span>

                  {/* Uploaded */}
                  <span className="text-[8px] text-slate-500">
                    {validDate
                      ? uploadedDate.toLocaleString()
                      : "—"}
                  </span>

                  {/* Status */}
                  <span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[7px] font-semibold capitalize ${
                        status === "processed"
                          ? "bg-green-50 text-green-600"
                          : status === "processing"
                          ? "bg-blue-50 text-blue-600"
                          : status === "failed"
                          ? "bg-red-50 text-red-600"
                          : status === "review_required"
                          ? "bg-orange-50 text-orange-600"
                          : "bg-yellow-50 text-yellow-600"
                      }`}
                    >
                      {status.replace("_", " ")}
                    </span>
                  </span>

                  {/* AI Search */}
                  <button
                    type="button"
                    title={`Open ${
                      doc.filename || "document"
                    } in AI Search`}
                    onClick={(e) =>
                      openInAiSearch(e, doc.id)
                    }
                    className="mx-auto flex h-7 w-7 items-center justify-center rounded-md text-[#3451D1] transition hover:bg-[#E8EEFF] hover:text-[#2440B8]"
                  >
                    <Bot size={15} />
                  </button>
                </div>

                {/* Expanded details */}
                {expandedId === doc.id && (
                  <div className="border-t border-slate-100 bg-[#fafbff] px-3.5 py-3">
                    {detailLoading ? (
                      <div className="flex items-center gap-2 text-[9px] text-slate-400">
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                        Loading compliance details...
                      </div>
                    ) : detailError ? (
                      <div className="flex items-center gap-2 text-[9px] text-red-500">
                        <AlertCircle size={14} />
                        <span>{detailError}</span>
                      </div>
                    ) : (
                      <>
                        {detail?.document?.summary && (
                          <div className="mb-3">
                            <p className="mb-1 text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                              AI Summary
                            </p>

                            <p className="text-[9px] leading-relaxed text-slate-600">
                              {detail.document.summary}
                            </p>
                          </div>
                        )}

                        {detail?.compliance?.length ? (
                          <div>
                            <p className="mb-1.5 text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                              Compliance
                            </p>

                            <div className="space-y-1.5">
                              {detail.compliance.map(
                                (item) => (
                                  <div
                                    key={item.id}
                                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-[9px] text-slate-600"
                                  >
                                    <span className="font-semibold">
                                      {item.risk_type ||
                                        "Risk"}
                                    </span>

                                    {" — "}

                                    Deadline{" "}
                                    {item.deadline_date ||
                                      "—"}

                                    {" — "}

                                    <span className="font-medium">
                                      {item.urgency ||
                                        "Unknown"}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-[9px] text-slate-400">
                            No compliance items for this
                            document.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Pagination */}
        {filteredDocuments.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-slate-200 px-3.5 py-2.5">
            <span className="text-[8px] text-slate-400">
              Page {safePage} of {totalPages}
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={safePage === 1}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(1, page - 1)
                  )
                }
                className="rounded-md border border-slate-200 px-2.5 py-1 text-[8px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-6 min-w-6 rounded-md px-1.5 text-[8px] font-semibold transition ${
                    safePage === page
                      ? "bg-[#003b73] text-white"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={safePage === totalPages}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
                className="rounded-md border border-slate-200 px-2.5 py-1 text-[8px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}