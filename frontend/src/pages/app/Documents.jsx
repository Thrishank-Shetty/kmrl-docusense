import { useCallback, useEffect, useMemo, useState } from "react";
import {FileText,Loader2,AlertCircle,ChevronDown,ChevronUp,RefreshCw,UploadCloud,Search,SlidersHorizontal,X,Bot,Pencil,Save,CheckCircle2,ShieldCheck,History,} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {getAllDocuments,getDocumentCompliance,getDocumentChanges,} from "../../lib/api";
import api from "../../lib/api";
import { useToast } from "../../components/common/useToast";

const PAGE_SIZE = 10;
const REVIEW_THRESHOLD = 0.7;

export default function Documents() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [documents, setDocuments] = useState([]);
  const [reviewDocuments, setReviewDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const [expandedId, setExpandedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [changes, setChanges] = useState([]);
  const [changesLoading, setChangesLoading] = useState(false);
  const [changesError, setChangesError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);

  const getConfidence = (doc) => {
    const value = Number(doc.extraction_confidence);
    return Number.isNaN(value) ? null : value;
  };

  const getDocumentType = (doc) => doc.doc_type || "Unknown";

  const isHumanVerified = (doc) => doc.human_verified === true;

  const isReviewRequired = (doc) => {
    const confidence = getConfidence(doc);

    return (
      confidence !== null &&
      confidence < REVIEW_THRESHOLD &&
      !isHumanVerified(doc)
    );
  };

  const loadDocuments = useCallback(
    async (isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      try {
        const [documentsResponse, reviewResponse] =
          await Promise.all([
            getAllDocuments(),
            api.get("/documents/review-required"),
          ]);

        const allDocuments = Array.isArray(
          documentsResponse.data
        )
          ? documentsResponse.data
          : documentsResponse.data?.documents || [];

        const reviewDocumentsData = Array.isArray(
          reviewResponse.data
        )
          ? reviewResponse.data
          : reviewResponse.data?.documents || [];

        setDocuments(allDocuments);
        setReviewDocuments(reviewDocumentsData);

        if (isRefresh) showToast("Documents refreshed");
      } catch (err) {
        console.error("Failed to load documents:", err);

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
  const timer = setTimeout(() => loadDocuments(), 0);
  return () => clearTimeout(timer);
}, [loadDocuments]);

  const reviewRequiredIds = useMemo(
    () =>
      new Set(
        reviewDocuments.map((doc) => doc.id).filter(Boolean)
      ),
    [reviewDocuments]
  );

  const documentTypes = useMemo(() => {
    const types = documents
      .map(getDocumentType)
      .filter((type) => type !== "Unknown");

    return ["all", ...new Set(types)];
  }, [documents]);

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
  }, [documents, search, typeFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDocuments.length / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedDocuments = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredDocuments.slice(start, start + PAGE_SIZE);
  }, [filteredDocuments, safePage]);

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const hasFilters =
    search.trim() ||
    typeFilter !== "all" ||
    sortBy !== "newest";

  const toggleRow = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      setDetailError(null);
      setChanges([]);
      setChangesError(null);
      setEditingId(null);
      setEditData({});
      return;
    }

    setExpandedId(id);
    setDetail(null);
    setDetailError(null);
    setChanges([]);
    setChangesError(null);
    setEditingId(null);
    setEditData({});
    setDetailLoading(true);
    setChangesLoading(true);

    try {
      const detailResponse = await getDocumentCompliance(id);
      setDetail(detailResponse.data);
    } catch (err) {
      console.error("Failed to load document details:", err);

      const message =
        err.response?.data?.detail ||
        "Failed to load compliance details.";

      setDetailError(message);
      showToast(message, "error");
    } finally {
      setDetailLoading(false);
    }

    try {
      const changesResponse = await getDocumentChanges(id);

      setChanges(
        Array.isArray(changesResponse.data?.changes)
          ? changesResponse.data.changes
          : []
      );
    } catch (err) {
      console.error("Failed to load document changes:", err);

      setChanges([]);
      setChangesError(
        err.response?.data?.detail ||
          "Failed to load revision history."
      );
    } finally {
      setChangesLoading(false);
    }
  };

  const startHumanReview = async (event, document) => {
    event.stopPropagation();

    const reviewRequired =
      reviewRequiredIds.has(document.id) ||
      isReviewRequired(document);

    if (!reviewRequired) return;

    setExpandedId(document.id);
    setEditingId(document.id);
    setDetail(null);
    setDetailError(null);

    setEditData({
      doc_type: document.doc_type || "",
      summary: document.summary || "",
      reference_number: document.reference_number || "",
      department: document.department || "",
      issue_date: document.issue_date || "",
      expiry_date: document.expiry_date || "",
      amount: document.amount ?? "",
      vendor_party:
        document.vendor_party ||
        document.vendor ||
        document.party_name ||
        "",
      asset_id: document.asset_id || "",
    });

    try {
      const response = await api.get(
        `/documents/${document.id}`
      );

      const latest = response.data;

      if (latest) {
        setEditData({
          doc_type: latest.doc_type || "",
          summary: latest.summary || "",
          reference_number:
            latest.reference_number || "",
          department: latest.department || "",
          issue_date: latest.issue_date || "",
          expiry_date: latest.expiry_date || "",
          amount: latest.amount ?? "",
          vendor_party:
            latest.vendor_party ||
            latest.vendor ||
            latest.party_name ||
            "",
          asset_id: latest.asset_id || "",
        });
      }
    } catch (err) {
      console.warn(
        "Could not fetch individual document details:",
        err
      );
    }
  };

  const updateEditField = (field, value) => {
    setEditData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async (documentId) => {
    if (!documentId || saving) return;

    try {
      setSaving(true);

      await api.put(`/documents/${documentId}`, editData);

      showToast(
        "Document information updated successfully"
      );

      setEditingId(null);
      setEditData({});
      await loadDocuments(true);
    } catch (err) {
      console.error("Failed to update document:", err);

      const message =
        err.response?.data?.detail ||
        "Failed to save document changes.";

      setError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async (documentId) => {
    if (!documentId || verifyingId) return;

    try {
      setVerifyingId(documentId);

      await api.post(`/documents/${documentId}/verify`);

      showToast("Document verified successfully");

      setEditingId(null);
      setEditData({});
      setExpandedId(null);
      setDetail(null);
      setChanges([]);
      setChangesError(null);

      await loadDocuments(true);
    } catch (err) {
      console.error("Failed to verify document:", err);

      const message =
        err.response?.data?.detail ||
        "Failed to verify document.";

      setError(message);
      showToast(message, "error");
    } finally {
      setVerifyingId(null);
    }
  };

  const openInAiSearch = (event, documentId) => {
    event.stopPropagation();
    navigate(`/ai-search?documentId=${documentId}`);
  };

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
      {/* HEADER */}
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
              className={
                refreshing ? "animate-spin" : ""
              }
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

      {/* SEARCH + FILTERS */}
      <div className="mt-4 rounded-md border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
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

          {reviewDocuments.length > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 font-semibold text-orange-600">
              <AlertCircle size={9} />
              {reviewDocuments.length} need review
            </span>
          )}
        </div>
      </div>

      {/* TABLE */}
      <section className="mt-3 overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="grid grid-cols-[1.6fr_1fr_1fr_0.8fr_0.35fr] border-b border-slate-200 bg-[#fcfcfd] px-3.5 py-2">
          {["Filename", "Type", "Uploaded", "Manual Review", "AI"].map(
            (header, index) => (
              <span
                key={header}
                className={`text-[7px] font-medium uppercase tracking-wide text-slate-500 ${
                  index === 4 ? "text-center" : ""
                }`}
              >
                {header}
              </span>
            )
          )}
        </div>

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

            const confidence = getConfidence(doc);

            const reviewRequired =
              reviewRequiredIds.has(doc.id) ||
              isReviewRequired(doc);

            const isEditing = editingId === doc.id;
            const isVerifying = verifyingId === doc.id;

            return (
              <div
                key={doc.id}
                className="border-b border-slate-200 last:border-b-0"
              >
                {/* MAIN ROW */}
                <div className="grid grid-cols-[1.6fr_1fr_1fr_0.8fr_0.35fr] items-center px-3.5 py-2.5">
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

                  <span className="truncate text-[8px] text-slate-500">
                    {doc.doc_type || "Unknown"}
                  </span>

                  <span className="text-[8px] text-slate-500">
                    {validDate
                      ? uploadedDate.toLocaleString()
                      : "—"}
                  </span>

                  <div>
                    {reviewRequired ? (
                      <button
                        type="button"
                        onClick={(event) =>
                          startHumanReview(event, doc)
                        }
                        className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[7px] font-bold text-orange-600 transition hover:bg-orange-100 hover:text-orange-700"
                        title="Review and verify extracted information"
                      >
                        <Pencil size={8} />
                        Yes
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[7px] font-semibold text-green-600">
                        <CheckCircle2 size={8} />
                        No
                      </span>
                    )}

                    {confidence !== null && (
                      <p className="mt-0.5 text-[7px] text-slate-400">
                        {(confidence * 100).toFixed(1)}%
                        confidence
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    title={`Open ${
                      doc.filename || "document"
                    } in AI Search`}
                    onClick={(event) =>
                      openInAiSearch(event, doc.id)
                    }
                    className="mx-auto flex h-7 w-7 items-center justify-center rounded-md text-[#3451D1] transition hover:bg-[#E8EEFF] hover:text-[#2440B8]"
                  >
                    <Bot size={15} />
                  </button>
                </div>

                {/* EXPANDED */}
                {expandedId === doc.id && (
                  <div className="border-t border-slate-100 bg-[#fafbff] px-3.5 py-3">
                    {isEditing ? (
                      <div>
                        {/* REVIEW HEADER */}
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <ShieldCheck
                                size={14}
                                className="text-orange-500"
                              />

                              <p className="text-[9px] font-bold uppercase tracking-wide text-orange-600">
                                Human Review Required
                              </p>
                            </div>

                            <p className="mt-1 text-[8px] text-slate-400">
                              The AI extraction confidence is below the
                              required threshold. Review and correct the
                              extracted information before verifying this
                              document.
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              type="button"
                              onClick={cancelEditing}
                              disabled={saving || isVerifying}
                              className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-[8px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                              <X size={11} />
                              Cancel
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSave(doc.id)}
                              disabled={saving || isVerifying}
                              className="inline-flex h-7 items-center gap-1 rounded-md bg-[#003b73] px-2.5 text-[8px] font-semibold text-white transition hover:bg-[#064b8c] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {saving ? (
                                <>
                                  <Loader2
                                    size={11}
                                    className="animate-spin"
                                  />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save size={11} />
                                  Save Changes
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleVerify(doc.id)}
                              disabled={saving || isVerifying}
                              className="inline-flex h-7 items-center gap-1 rounded-md bg-[#087443] px-2.5 text-[8px] font-semibold text-white transition hover:bg-[#096138] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isVerifying ? (
                                <>
                                  <Loader2
                                    size={11}
                                    className="animate-spin"
                                  />
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 size={11} />
                                  Mark Verified
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* CONFIDENCE */}
                        <div className="mt-3 flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 py-2">
                          <AlertCircle
                            size={13}
                            className="text-orange-500"
                          />

                          <span className="text-[8px] font-semibold text-orange-700">
                            Extraction Confidence:
                          </span>

                          <span className="text-[8px] font-bold text-orange-700">
                            {confidence !== null
                              ? `${(confidence * 100).toFixed(1)}%`
                              : "Unknown"}
                          </span>
                        </div>

                        {/* EDIT FIELDS */}
                        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                          {[
                            ["doc_type", "Document Type"],
                            ["reference_number", "Reference Number"],
                            ["department", "Department"],
                            ["issue_date", "Issue Date", "date"],
                            ["expiry_date", "Expiry Date", "date"],
                            ["amount", "Amount"],
                            ["vendor_party", "Vendor / Party"],
                            ["asset_id", "Asset ID"],
                          ].map(([field, label, type]) => (
                            <div key={field}>
                              <label className="mb-1 block text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                                {label}
                              </label>

                              <input
                                type={type || "text"}
                                value={editData[field] ?? ""}
                                onChange={(event) =>
                                  updateEditField(
                                    field,
                                    event.target.value
                                  )
                                }
                                placeholder={
                                  field === "amount"
                                    ? "Amount"
                                    : undefined
                                }
                                className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[9px] text-slate-700 outline-none focus:border-[#0056a6]"
                              />
                            </div>
                          ))}
                        </div>

                        {/* SUMMARY */}
                        <div className="mt-3">
                          <label className="mb-1 block text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                            Summary
                          </label>

                          <textarea
                            value={editData.summary || ""}
                            onChange={(event) =>
                              updateEditField(
                                "summary",
                                event.target.value
                              )
                            }
                            rows={5}
                            className="w-full resize-y rounded-md border border-slate-200 bg-white px-2.5 py-2 text-[9px] leading-relaxed text-slate-700 outline-none focus:border-[#0056a6]"
                          />
                        </div>
                      </div>
                    ) : detailLoading ? (
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
                        {/* REVIEW SHORTCUT */}
                        {reviewRequired && (
                          <div className="mb-3 flex items-center justify-between rounded-md border border-orange-200 bg-orange-50 px-3 py-2.5">
                            <div>
                              <p className="text-[8px] font-bold uppercase tracking-wide text-orange-600">
                                Human Review Required
                              </p>

                              <p className="mt-0.5 text-[8px] text-orange-700">
                                This document has not yet been verified
                                by a human.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={(event) =>
                                startHumanReview(event, doc)
                              }
                              className="inline-flex items-center gap-1 rounded-md bg-orange-500 px-2.5 py-1.5 text-[8px] font-semibold text-white transition hover:bg-orange-600"
                            >
                              <Pencil size={10} />
                              Review Document
                            </button>
                          </div>
                        )}

                        {/* AI SUMMARY */}
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

                        {/* COMPLIANCE */}
                        {detail?.compliance?.length ? (
                          <div>
                            <p className="mb-1.5 text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                              Compliance
                            </p>

                            <div className="space-y-1.5">
                              {detail.compliance.map((item) => (
                                <div
                                  key={item.id}
                                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-[9px] text-slate-600"
                                >
                                  <span className="font-semibold">
                                    {item.risk_type || "Risk"}
                                  </span>

                                  {" — "}

                                  Deadline{" "}
                                  {item.deadline_date || "—"}

                                  {" — "}

                                  <span className="font-medium">
                                    {item.urgency || "Unknown"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-[9px] text-slate-400">
                            No compliance items for this document.
                          </p>
                        )}

                        {/* DOCUMENT CHANGE HISTORY */}
                        <div className="mt-4 border-t border-slate-200 pt-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <History size={12} className="text-[#0056a6]" />
                              <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                                Revision History
                              </p>
                            </div>

                            {!changesLoading && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[7px] font-semibold text-slate-500">
                                {changes.length} {changes.length === 1 ? "change" : "changes"}
                              </span>
                            )}
                          </div>

                          {changesLoading ? (
                            <div className="mt-2 flex items-center gap-2 text-[9px] text-slate-400">
                              <Loader2 size={12} className="animate-spin" />
                              Loading revision history...
                            </div>
                          ) : changesError ? (
                            <div className="mt-2 flex items-center gap-2 text-[9px] text-red-500">
                              <AlertCircle size={12} />
                              {changesError}
                            </div>
                          ) : changes.length === 0 ? (
                            <p className="mt-2 text-[9px] text-slate-400">
                              No recorded changes for this document.
                            </p>
                          ) : (
                            <div className="mt-2 space-y-3">
                              {changes.map((change) => {
                                const oldEntities = change.old_entities || {};
                                const newEntities = change.new_entities || {};
                                const fields = [
                                  ["Document Type", oldEntities.doc_type, newEntities.doc_type],
                                  ["Reference Number", oldEntities.reference_number, newEntities.reference_number],
                                  ["Department", oldEntities.department, newEntities.department],
                                  ["Issue Date", oldEntities.issue_date, newEntities.issue_date],
                                  ["Expiry Date", oldEntities.expiry_date, newEntities.expiry_date],
                                  ["Amount", oldEntities.amount, newEntities.amount],
                                  ["Vendor / Party", oldEntities.vendor_or_party_name, newEntities.vendor_or_party_name],
                                  ["Asset ID", oldEntities.asset_id, newEntities.asset_id],
                                ].filter((fieldValues) =>
                                  String(fieldValues[1] ?? "") !==
                                  String(fieldValues[2] ?? "")
                                );

                                const formatValue = (value) =>
                                  value === null || value === undefined || value === ""
                                    ? "—"
                                    : String(value);

                                const createdAt = change.created_at
                                  ? new Date(change.created_at)
                                  : null;

                                return (
                                  <div
                                    key={change.change_id}
                                    className="rounded-md border border-slate-200 bg-white p-3"
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="min-w-0">
                                        <p className="truncate text-[9px] font-semibold text-[#173a61]">
                                          {change.old_filename || "Previous version"}
                                          <span className="mx-1 text-slate-400">→</span>
                                          {change.new_filename || doc.filename || "Current version"}
                                        </p>
                                      </div>

                                      {createdAt && !Number.isNaN(createdAt.getTime()) && (
                                        <span className="shrink-0 text-[7px] text-slate-400">
                                          {createdAt.toLocaleString()}
                                        </span>
                                      )}
                                    </div>

                                    {fields.length > 0 && (
                                      <div className="mt-2 overflow-hidden rounded-md border border-slate-100">
                                        <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-slate-100 bg-slate-50 px-2.5 py-1.5">
                                          <span className="text-[7px] font-semibold uppercase tracking-wide text-slate-400">Field</span>
                                          <span className="text-[7px] font-semibold uppercase tracking-wide text-slate-400">Previous</span>
                                          <span className="text-[7px] font-semibold uppercase tracking-wide text-slate-400">Revised</span>
                                        </div>

                                        {fields.map(([label, oldValue, newValue]) => (
                                          <div
                                            key={label}
                                            className="grid grid-cols-[1fr_1fr_1fr] border-b border-slate-100 px-2.5 py-1.5 last:border-b-0"
                                          >
                                            <span className="text-[8px] font-medium text-slate-600">{label}</span>
                                            <span className="break-words text-[8px] text-red-500">{formatValue(oldValue)}</span>
                                            <span className="break-words text-[8px] text-green-600">{formatValue(newValue)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {(change.old_summary || change.new_summary) && (
                                      <div className="mt-2 grid gap-2 md:grid-cols-2">
                                        {change.old_summary && (
                                          <div className="rounded-md bg-slate-50 px-2.5 py-2">
                                            <p className="text-[7px] font-semibold uppercase tracking-wide text-slate-400">Previous Summary</p>
                                            <p className="mt-1 text-[8px] leading-relaxed text-slate-600">
                                              {change.old_summary}
                                            </p>
                                          </div>
                                        )}

                                        {change.new_summary && (
                                          <div className="rounded-md bg-blue-50 px-2.5 py-2">
                                            <p className="text-[7px] font-semibold uppercase tracking-wide text-blue-500">Revised Summary</p>
                                            <p className="mt-1 text-[8px] leading-relaxed text-blue-800">
                                              {change.new_summary}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {change.ai_summary && (
                                      <div className="mt-2 rounded-md border border-blue-100 bg-[#f5f8ff] px-2.5 py-2">
                                        <p className="text-[7px] font-semibold uppercase tracking-wide text-[#52719a]">AI Change Summary</p>
                                        <p className="mt-1 text-[8px] leading-relaxed text-slate-600">
                                          {change.ai_summary}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* PAGINATION */}
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
  );}