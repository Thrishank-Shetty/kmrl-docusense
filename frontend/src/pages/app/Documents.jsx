import { useEffect, useState } from "react";
import { FileText, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { getAllDocuments, getDocumentCompliance } from "../../lib/api";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    getAllDocuments()
      .then((res) => setDocuments(res.data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load documents. Is the backend running?");
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleRow = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await getDocumentCompliance(id);
      setDetail(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#fafbff] p-5">
        <Loader2 className="animate-spin text-[#0056a6]" size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-[#fafbff] p-5">
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[11px] text-red-700">
          <AlertCircle size={16} /> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#fafbff] px-5 py-5">
      <h1 className="text-[24px] font-bold leading-tight text-[#061f3d]">Documents</h1>
      <p className="mt-1 text-[11px] text-slate-500">All documents processed by the system.</p>

      <section className="mt-4 overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="grid grid-cols-[1.6fr_1fr_1fr_0.8fr] border-b border-slate-200 bg-[#fcfcfd] px-3.5 py-2">
          <span className="text-[7px] font-medium uppercase tracking-wide text-slate-500">Filename</span>
          <span className="text-[7px] font-medium uppercase tracking-wide text-slate-500">Type</span>
          <span className="text-[7px] font-medium uppercase tracking-wide text-slate-500">Uploaded</span>
          <span className="text-[7px] font-medium uppercase tracking-wide text-slate-500">Confidence</span>
        </div>

        {documents.length === 0 ? (
          <div className="px-3.5 py-8 text-center text-[9px] text-slate-400">
            No documents yet — upload one to get started.
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="border-b border-slate-200 last:border-b-0">
              <button
                onClick={() => toggleRow(doc.id)}
                className="grid w-full grid-cols-[1.6fr_1fr_1fr_0.8fr] items-center px-3.5 py-2.5 text-left hover:bg-[#fafbff]"
              >
                <div className="flex items-center gap-2">
                  {expandedId === doc.id ? (
                    <ChevronUp size={12} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={12} className="text-slate-400" />
                  )}
                  <FileText size={14} className="text-red-500" />
                  <span className="text-[9px] font-medium text-[#173a61]">{doc.filename}</span>
                </div>
                <span className="text-[8px] text-slate-500">{doc.doc_type || "—"}</span>
                <span className="text-[8px] text-slate-500">
                  {new Date(doc.upload_date).toLocaleString()}
                </span>
                <span className="text-[8px] text-slate-500">
                  {doc.extraction_confidence
                    ? `${(parseFloat(doc.extraction_confidence) * 100).toFixed(0)}%`
                    : "—"}
                </span>
              </button>

              {expandedId === doc.id && (
                <div className="border-t border-slate-100 bg-[#fafbff] px-3.5 py-3">
                  {detailLoading ? (
                    <Loader2 size={14} className="animate-spin text-slate-400" />
                  ) : detail?.compliance?.length ? (
                    <div className="space-y-1.5">
                      {detail.compliance.map((c) => (
                        <div key={c.id} className="text-[9px] text-slate-600">
                          {c.risk_type} — deadline {c.deadline_date} —{" "}
                          <span className="font-medium">{c.urgency}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[9px] text-slate-400">No compliance items for this document.</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}