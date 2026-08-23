import { useState } from "react";
import {
  Search,
  Sparkles,
  FileText,
  FolderOpen,
  ArrowRight,
  Loader2,
  X,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { askDocument } from "../../lib/api";

export default function AISearch() {
  const [searchParams] = useSearchParams();
  const documentId = searchParams.get("documentId");

  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim() || loading) return;

    if (!documentId) {
      setError("No document selected. Please select a document first.");
      return;
    }

    setLoading(true);
    setSearched(true);
    setError("");
    setAnswer("");

    try {
      const response = await askDocument(
        documentId,
        query.trim()
      );

      setAnswer(
        response.data?.answer ||
          "No answer was generated."
      );
    } catch (error) {
      console.error("AI search failed:", error);

      setError(
        error.response?.data?.detail ||
          "Unable to generate a response. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery("");
    setAnswer("");
    setError("");
    setSearched(false);
  };

  return (
    <div className="min-h-full bg-[#f8f9fd] px-6 py-7">
      <div className="mx-auto max-w-[1050px]">

        {/* Hero */}
        <section className="flex flex-col items-center pt-2 text-center">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl border border-[#c9d8f3] bg-[#e6efff] text-[#063b78]">
            <Sparkles size={23} />
          </div>

          <h1 className="text-[27px] font-bold tracking-tight text-[#062b55]">
            Ask your document.
          </h1>

          <p className="mt-2 max-w-[600px] text-[11px] leading-relaxed text-slate-500">
            Ask questions about your selected KMRL document
            using natural language.
          </p>
        </section>

        {/* Search */}
        <section className="mt-6 overflow-hidden rounded-xl border border-[#d6ddea] bg-white shadow-[0_2px_8px_rgba(25,50,90,0.04)]">

          <div className="flex items-center gap-3 px-4 py-3">
            <Search
              size={18}
              className="shrink-0 text-slate-500"
            />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something about this document..."
              className="min-w-0 flex-1 border-0 bg-transparent text-[12px] text-[#173a61] outline-none placeholder:text-slate-400"
            />

            {query && (
              <button
                onClick={clearSearch}
                className="text-slate-400 transition hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}

            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="inline-flex h-8 items-center gap-2 rounded-md bg-[#062d59] px-4 text-[10px] font-semibold text-white transition hover:bg-[#08447f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2
                    size={13}
                    className="animate-spin"
                  />
                  Searching
                </>
              ) : (
                <>
                  Search
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>

          {/* Search scope */}
          <div className="flex items-center gap-2 border-t border-[#e1e6ef] bg-[#f8faff] px-4 py-2.5">
            <span className="text-[8px] font-medium uppercase tracking-wide text-slate-400">
              Searching in:
            </span>

            <div className="inline-flex items-center gap-1.5 rounded border border-[#d4dce9] bg-white px-2 py-1 text-[8px] font-medium text-[#40516a]">
              <FolderOpen size={10} />
              Selected Document
            </div>

            <span className="ml-auto text-[8px] text-slate-400">
              {loading
                ? "Generating response..."
                : searched
                ? "Search complete"
                : documentId
                ? `Document #${documentId} selected`
                : "No document selected"}
            </span>
          </div>
        </section>

        {/* Error */}
        {error && (
          <section className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-100 text-red-500">
                <X size={15} />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-red-600">
                  AI Search Error
                </p>

                <p className="mt-1 text-[10px] leading-relaxed text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* AI Answer */}
        {answer && (
          <section className="mt-5 rounded-xl border border-[#cbd9ed] bg-white p-4 shadow-[0_2px_8px_rgba(25,50,90,0.03)]">
            <div className="flex items-start gap-3">

              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#e7effd] text-[#0754a0]">
                <Sparkles size={15} />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wide text-[#52719a]">
                  AI Answer
                </p>

                <p className="mt-2 whitespace-pre-wrap text-[11px] leading-[1.7] text-[#334155]">
                  {answer}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Initial suggestions */}
        {!searched && (
          <div className="mt-7 text-center">
            <p className="text-[9px] text-slate-400">
              Try asking things like:
            </p>

            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {[
                "Summarize this document",
                "What is the reference number?",
                "What are the important deadlines?",
                "What are the key compliance requirements?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setQuery(suggestion)}
                  className="rounded-full border border-[#d8e0ec] bg-white px-3 py-1.5 text-[9px] text-slate-500 transition hover:border-[#8eacd3] hover:bg-[#f5f8ff] hover:text-[#174b80]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No answer */}
        {!loading &&
          searched &&
          !answer &&
          !error && (
            <div className="mt-12 flex flex-col items-center text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100">
                <FileText
                  size={20}
                  className="text-slate-400"
                />
              </div>

              <p className="mt-3 text-[12px] font-semibold text-slate-700">
                No answer found
              </p>

              <p className="mt-1 max-w-[350px] text-[9px] text-slate-400">
                Try asking your question differently.
              </p>
            </div>
          )}

      </div>
    </div>
  );
}