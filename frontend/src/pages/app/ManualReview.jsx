// <<<<<<< HEAD
// import {
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";
// import {
//   Search,
//   RefreshCw,
//   FileText,
//   CheckCircle2,
//   AlertCircle,
//   Loader2,
//   ChevronDown,
//   ChevronUp,
//   Eye,
// } from "lucide-react";

// import {
//   getReviewRequiredDocuments,
//   verifyDocument,
// } from "../../lib/api";
// =======
// import { useCallback, useEffect, useMemo, useState } from "react";
// import {Search,RefreshCw,FileText,CheckCircle2,AlertCircle,Loader2,ChevronUp,Eye,} from "lucide-react";
// import {getReviewRequiredDocuments,verifyDocument,} from "../../lib/api";
// >>>>>>> origin/main

// export default function ManualReview() {
//   const [documents, setDocuments] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [verifyingId, setVerifyingId] = useState(null);
//   const [error, setError] = useState("");
//   const [expandedId, setExpandedId] = useState(null);

// <<<<<<< HEAD
//   const loadDocuments = useCallback(
//     async (isRefresh = false) => {
//       try {
//         if (isRefresh) {
//           setRefreshing(true);
//         }

//         setError("");

//         const response =
//           await getReviewRequiredDocuments();

//         const data = Array.isArray(response.data)
//           ? response.data
//           : response.data?.documents || [];

//         setDocuments(data);
//       } catch (err) {
//         console.error(
//           "Failed to load manual review documents:",
//           err
//         );

//         setError(
//           err.response?.data?.detail ||
//             "Unable to load documents requiring manual review."
//         );
//       } finally {
//         setLoading(false);
//         setRefreshing(false);
//       }
//     },
//     []
//   );

//   useEffect(() => {
//     loadDocuments();
//   }, [loadDocuments]);

//   const filteredDocuments = useMemo(() => {
//     const normalizedSearch =
//       search.trim().toLowerCase();

//     return documents.filter((document) => {
//       const confidence =
//         document.extraction_confidence ??
//         document.confidence ??
//         document.confidence_score;

//       const numericConfidence =
//         typeof confidence === "number"
//           ? confidence
//           : Number(confidence);

//       const confidenceValue =
//         numericConfidence <= 1
//           ? numericConfidence * 100
//           : numericConfidence;

//       // Only show documents below 75% confidence
//       if (confidenceValue >= 75) {
//         return false;
//       }

//       if (!normalizedSearch) {
//         return true;
//       }

//       const filename =
//         document.filename ||
//         document.file_name ||
//         "";

//       const docType =
//         document.doc_type ||
//         document.document_type ||
//         "";

//       const status =
//         document.status || "";

//       return (
//         filename
//           .toLowerCase()
//           .includes(normalizedSearch) ||
//         docType
//           .toLowerCase()
//           .includes(normalizedSearch) ||
//         status
//           .toLowerCase()
//           .includes(normalizedSearch)
// =======
//   const loadDocuments = useCallback(async (refresh = false) => {
//     try {
//       if (refresh) setRefreshing(true);
//       setError("");

//       const response = await getReviewRequiredDocuments();
//       const data = Array.isArray(response.data)
//         ? response.data
//         : response.data?.documents || [];

//       setDocuments(data);
//     } catch (err) {
//       console.error("Failed to load manual review documents:", err);
//       setError(
//         err.response?.data?.detail ||
//           "Unable to load documents requiring manual review."
//       );
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//   const timer = setTimeout(() => loadDocuments(), 0);
//   return () => clearTimeout(timer);
// }, [loadDocuments]);

//   const getConfidence = (doc) => {
//     const value =
//       doc.extraction_confidence ??
//       doc.confidence ??
//       doc.confidence_score;

//     const numeric = typeof value === "number" ? value : Number(value);

//     if (Number.isNaN(numeric)) return null;
//     return numeric <= 1 ? numeric * 100 : numeric;
//   };

//   const filteredDocuments = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     return documents.filter((doc) => {
//       const confidence = getConfidence(doc);

//       // Only show documents below 75%
//       if (confidence !== null && confidence >= 75) return false;

//       if (!query) return true;

//       const filename = (
//         doc.filename ||
//         doc.file_name ||
//         ""
//       ).toLowerCase();

//       const type = (
//         doc.doc_type ||
//         doc.document_type ||
//         ""
//       ).toLowerCase();

//       const status = (doc.status || "").toLowerCase();

//       return (
//         filename.includes(query) ||
//         type.includes(query) ||
//         status.includes(query)
// >>>>>>> origin/main
//       );
//     });
//   }, [documents, search]);

// <<<<<<< HEAD
//   const getConfidence = (document) => {
//     const confidence =
//       document.extraction_confidence ??
//       document.confidence ??
//       document.confidence_score;

//     const numericConfidence =
//       typeof confidence === "number"
//         ? confidence
//         : Number(confidence);

//     if (Number.isNaN(numericConfidence)) {
//       return null;
//     }

//     return numericConfidence <= 1
//       ? numericConfidence * 100
//       : numericConfidence;
//   };

//   const handleVerify = async (documentId) => {
//     if (!documentId || verifyingId) {
//       return;
//     }

//     try {
//       setVerifyingId(documentId);
//       setError("");

//       await verifyDocument(documentId);

//       // Remove immediately from current list
//       setDocuments((current) =>
//         current.filter(
//           (document) => document.id !== documentId
//         )
//       );

//       // Refresh from backend
//       await loadDocuments(true);
//     } catch (err) {
//       console.error(
//         "Failed to verify document:",
//         err
//       );

// =======
//   const handleVerify = async (id) => {
//     if (!id || verifyingId) return;

//     try {
//       setVerifyingId(id);
//       setError("");

//       await verifyDocument(id);

//       setDocuments((current) =>
//         current.filter((doc) => doc.id !== id)
//       );

//       setExpandedId(null);
//       await loadDocuments(true);
//     } catch (err) {
//       console.error("Failed to verify document:", err);
// >>>>>>> origin/main
//       setError(
//         err.response?.data?.detail ||
//           "Unable to verify this document. Please try again."
//       );
//     } finally {
//       setVerifyingId(null);
//     }
//   };

// <<<<<<< HEAD
//   const toggleExpanded = (documentId) => {
//     setExpandedId((current) =>
//       current === documentId
//         ? null
//         : documentId
//     );
// =======
//   const toggleExpanded = (id) => {
//     setExpandedId((current) => (current === id ? null : id));
// >>>>>>> origin/main
//   };

//   return (
//     <div className="min-h-full bg-[#f8f9fd] px-6 py-7">
//       <div className="mx-auto max-w-[1200px]">

// <<<<<<< HEAD
//         {/* Header */}
//         <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
//           <div>
//             <div className="flex items-center gap-2">
//               <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#fff3df] text-[#b66a00]">
//                 <AlertCircle size={18} />
//               </div>

//               <div>
//                 <h1 className="text-[22px] font-bold tracking-tight text-[#062b55]">
//                   Manual Review
//                 </h1>

//                 <p className="mt-0.5 text-[10px] text-slate-500">
//                   Documents requiring manual verification due to low extraction confidence.
//                 </p>
//               </div>
// =======
//         {/* HEADER */}
//         <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
//           <div className="flex items-center gap-2">
//             <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#fff3df] text-[#b66a00]">
//               <AlertCircle size={18} />
//             </div>

//             <div>
//               <h1 className="text-[22px] font-bold tracking-tight text-[#062b55]">
//                 Manual Review
//               </h1>

//               <p className="mt-0.5 text-[10px] text-slate-500">
//                 Documents requiring manual verification due to low extraction confidence.
//               </p>
// >>>>>>> origin/main
//             </div>
//           </div>

//           <button
//             onClick={() => loadDocuments(true)}
//             disabled={refreshing || loading}
//             className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#d5deeb] bg-white px-3 text-[10px] font-semibold text-[#36516f] transition hover:bg-[#f5f8fc] disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             <RefreshCw
//               size={13}
// <<<<<<< HEAD
//               className={
//                 refreshing
//                   ? "animate-spin"
//                   : ""
//               }
//             />

// =======
//               className={refreshing ? "animate-spin" : ""}
//             />
// >>>>>>> origin/main
//             Refresh
//           </button>
//         </section>

// <<<<<<< HEAD
//         {/* Summary */}
//         <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

//           <div className="rounded-xl border border-[#d8e0eb] bg-white p-4">
//             <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
//               Awaiting Review
//             </p>

//             <p className="mt-1 text-[22px] font-bold text-[#062b55]">
//               {documents.length}
//             </p>
//           </div>

//           <div className="rounded-xl border border-[#d8e0eb] bg-white p-4">
//             <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
//               Displayed
//             </p>

//             <p className="mt-1 text-[22px] font-bold text-[#062b55]">
//               {filteredDocuments.length}
//             </p>
//           </div>

//           <div className="rounded-xl border border-[#d8e0eb] bg-white p-4">
//             <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
//               Confidence Threshold
//             </p>

//             <p className="mt-1 text-[22px] font-bold text-[#b66a00]">
//               &lt; 75%
//             </p>
//           </div>

//         </section>

//         {/* Search */}
//         <section className="mt-5 rounded-xl border border-[#d8e0eb] bg-white p-3">
//           <div className="flex items-center gap-2">
//             <Search
//               size={16}
//               className="shrink-0 text-slate-400"
//             />

//             <input
//               value={search}
//               onChange={(e) =>
//                 setSearch(e.target.value)
//               }
// =======
//         {/* SUMMARY */}
//         <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
//           {[
//             ["Awaiting Review", documents.length, "text-[#062b55]"],
//             ["Displayed", filteredDocuments.length, "text-[#062b55]"],
//             ["Confidence Threshold", "< 75%", "text-[#b66a00]"],
//           ].map(([label, value, color]) => (
//             <div
//               key={label}
//               className="rounded-xl border border-[#d8e0eb] bg-white p-4"
//             >
//               <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
//                 {label}
//               </p>

//               <p className={`mt-1 text-[22px] font-bold ${color}`}>
//                 {value}
//               </p>
//             </div>
//           ))}
//         </section>

//         {/* SEARCH */}
//         <section className="mt-5 rounded-xl border border-[#d8e0eb] bg-white p-3">
//           <div className="flex items-center gap-2">
//             <Search size={16} className="shrink-0 text-slate-400" />

//             <input
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
// >>>>>>> origin/main
//               placeholder="Search documents for review..."
//               className="min-w-0 flex-1 border-0 bg-transparent text-[11px] text-[#173a61] outline-none placeholder:text-slate-400"
//             />
//           </div>
//         </section>

// <<<<<<< HEAD
//         {/* Error */}
//         {error && (
//           <section className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
//             <div className="flex items-start gap-3">

// =======
//         {/* ERROR */}
//         {error && (
//           <section className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
//             <div className="flex items-start gap-3">
// >>>>>>> origin/main
//               <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-100 text-red-500">
//                 <AlertCircle size={15} />
//               </div>

//               <div>
//                 <p className="text-[9px] font-bold uppercase tracking-wide text-red-600">
//                   Manual Review Error
//                 </p>

//                 <p className="mt-1 text-[10px] text-red-700">
//                   {error}
//                 </p>
//               </div>
// <<<<<<< HEAD

// =======
// >>>>>>> origin/main
//             </div>
//           </section>
//         )}

// <<<<<<< HEAD
//         {/* Loading */}
//         {loading && (
//           <div className="flex min-h-[300px] items-center justify-center">
//             <div className="flex items-center gap-2 text-[10px] text-slate-500">
//               <Loader2
//                 size={16}
//                 className="animate-spin"
//               />

// =======
//         {/* LOADING */}
//         {loading && (
//           <div className="flex min-h-[300px] items-center justify-center">
//             <div className="flex items-center gap-2 text-[10px] text-slate-500">
//               <Loader2 size={16} className="animate-spin" />
// >>>>>>> origin/main
//               Loading documents...
//             </div>
//           </div>
//         )}

// <<<<<<< HEAD
//         {/* Empty */}
//         {!loading &&
//           !error &&
//           filteredDocuments.length === 0 && (
//             <section className="mt-5 rounded-xl border border-[#d8e0eb] bg-white px-6 py-14 text-center">

//               <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#edf7ef] text-[#32804b]">
//                 <CheckCircle2 size={22} />
//               </div>

//               <h2 className="mt-4 text-[13px] font-bold text-[#173a61]">
//                 No documents require manual review
//               </h2>

//               <p className="mx-auto mt-1 max-w-[400px] text-[9px] leading-relaxed text-slate-400">
//                 All documents currently meet the required extraction confidence threshold.
//               </p>

//             </section>
//           )}

//         {/* Documents */}
//         {!loading &&
//           filteredDocuments.length > 0 && (
//             <section className="mt-5 overflow-hidden rounded-xl border border-[#d8e0eb] bg-white">

//               {/* Table Header */}
//               <div className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto] items-center gap-4 border-b border-[#e1e6ef] bg-[#f8faff] px-5 py-3 md:grid">

//                 <span className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
//                   Document
//                 </span>

//                 <span className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
//                   Type
//                 </span>

//                 <span className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
//                   Confidence
//                 </span>

//                 <span className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
//                   Status
//                 </span>

//                 <span className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
//                   Action
//                 </span>

//               </div>

//               {filteredDocuments.map(
//                 (document) => {
//                   const confidence =
//                     getConfidence(
//                       document
//                     );

//                   const documentId =
//                     document.id;

//                   const filename =
//                     document.filename ||
//                     document.file_name ||
//                     "Unnamed document";

//                   const docType =
//                     document.doc_type ||
//                     document.document_type ||
//                     "Unknown";

//                   const status =
//                     document.status ||
//                     "Requires Review";

//                   const expanded =
//                     expandedId ===
//                     documentId;

//                   const verifying =
//                     verifyingId ===
//                     documentId;

//                   return (
//                     <div
//                       key={documentId}
//                       className="border-b border-[#e8ecf2] last:border-b-0"
//                     >

//                       {/* Row */}
//                       <div className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto] md:items-center md:gap-4">

//                         {/* Document */}
//                         <div className="flex min-w-0 items-center gap-3">

//                           <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#edf3fc] text-[#32659b]">
//                             <FileText size={16} />
//                           </div>

//                           <div className="min-w-0">
//                             <p className="truncate text-[10px] font-semibold text-[#173a61]">
//                               {filename}
//                             </p>

//                             {document.upload_date && (
//                               <p className="mt-0.5 text-[8px] text-slate-400">
//                                 Uploaded{" "}
//                                 {new Date(
//                                   document.upload_date
//                                 ).toLocaleDateString()}
//                               </p>
//                             )}
//                           </div>

//                         </div>

//                         {/* Type */}
//                         <div>
//                           <p className="text-[8px] uppercase tracking-wide text-slate-400 md:hidden">
//                             Type
//                           </p>

//                           <p className="text-[10px] text-slate-600">
//                             {docType}
//                           </p>
//                         </div>

//                         {/* Confidence */}
//                         <div>
//                           <p className="text-[8px] uppercase tracking-wide text-slate-400 md:hidden">
//                             Confidence
//                           </p>

//                           <span className="inline-flex rounded-md bg-red-50 px-2 py-1 text-[9px] font-bold text-red-600">
//                             {confidence !==
//                             null
//                               ? `${confidence.toFixed(
//                                   1
//                                 )}%`
//                               : "Unknown"}
//                           </span>
//                         </div>

//                         {/* Status */}
//                         <div>
//                           <p className="text-[8px] uppercase tracking-wide text-slate-400 md:hidden">
//                             Status
//                           </p>

//                           <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[8px] font-semibold text-amber-700">
//                             {status}
//                           </span>
//                         </div>

//                         {/* Actions */}
//                         <div className="flex items-center gap-2">

//                           <button
//                             onClick={() =>
//                               toggleExpanded(
//                                 documentId
//                               )
//                             }
//                             className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#d5deeb] bg-white px-2.5 text-[9px] font-semibold text-[#36516f] transition hover:bg-[#f5f8fc]"
//                           >
//                             {expanded ? (
//                               <ChevronUp
//                                 size={13}
//                               />
//                             ) : (
//                               <Eye
//                                 size={13}
//                               />
//                             )}

//                             {expanded
//                               ? "Hide"
//                               : "Review"}
//                           </button>

//                           <button
//                             onClick={() =>
//                               handleVerify(
//                                 documentId
//                               )
//                             }
//                             disabled={
//                               verifying
//                             }
//                             className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#087443] px-2.5 text-[9px] font-semibold text-white transition hover:bg-[#096138] disabled:cursor-not-allowed disabled:opacity-50"
//                           >
//                             {verifying ? (
//                               <>
//                                 <Loader2
//                                   size={12}
//                                   className="animate-spin"
//                                 />

//                                 Verifying
//                               </>
//                             ) : (
//                               <>
//                                 <CheckCircle2
//                                   size={12}
//                                 />

//                                 Verify
//                               </>
//                             )}
//                           </button>

//                         </div>
//                       </div>

//                       {/* Expanded Review */}
//                       {expanded && (
//                         <div className="border-t border-[#e8ecf2] bg-[#fbfcfe] px-5 py-4">

//                           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

//                             {/* Document Details */}
//                             <div>

//                               <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
//                                 Document Details
//                               </p>

//                               <div className="mt-2 space-y-2 rounded-lg border border-[#e0e6ef] bg-white p-3">

//                                 <div className="flex justify-between gap-4">
//                                   <span className="text-[9px] text-slate-400">
//                                     Filename
//                                   </span>

//                                   <span className="text-right text-[9px] font-medium text-slate-600">
//                                     {filename}
//                                   </span>
//                                 </div>

//                                 <div className="flex justify-between gap-4">
//                                   <span className="text-[9px] text-slate-400">
//                                     Document Type
//                                   </span>

//                                   <span className="text-right text-[9px] font-medium text-slate-600">
//                                     {docType}
//                                   </span>
//                                 </div>

//                                 <div className="flex justify-between gap-4">
//                                   <span className="text-[9px] text-slate-400">
//                                     Confidence
//                                   </span>

//                                   <span className="text-right text-[9px] font-bold text-red-600">
//                                     {confidence !==
//                                     null
//                                       ? `${confidence.toFixed(
//                                           1
//                                         )}%`
//                                       : "Unknown"}
//                                   </span>
//                                 </div>

//                                 <div className="flex justify-between gap-4">
//                                   <span className="text-[9px] text-slate-400">
//                                     Status
//                                   </span>

//                                   <span className="text-right text-[9px] font-medium text-slate-600">
//                                     {status}
//                                   </span>
//                                 </div>

//                               </div>
//                             </div>

//                             {/* Extracted Information */}
//                             <div>

//                               <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
//                                 Extracted Information
//                               </p>

//                               <div className="mt-2 rounded-lg border border-[#e0e6ef] bg-white p-3">

//                                 {document.summary ? (
//                                   <p className="whitespace-pre-wrap text-[9px] leading-relaxed text-slate-600">
//                                     {
//                                       document.summary
//                                     }
//                                   </p>
//                                 ) : (
//                                   <p className="text-[9px] text-slate-400">
//                                     No extracted summary available.
//                                   </p>
//                                 )}

//                               </div>
//                             </div>

//                           </div>

//                         </div>
//                       )}

//                     </div>
//                   );
//                 }
//               )}

//             </section>
//           )}

// =======
//         {/* EMPTY */}
//         {!loading && !error && filteredDocuments.length === 0 && (
//           <section className="mt-5 rounded-xl border border-[#d8e0eb] bg-white px-6 py-14 text-center">
//             <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#edf7ef] text-[#32804b]">
//               <CheckCircle2 size={22} />
//             </div>

//             <h2 className="mt-4 text-[13px] font-bold text-[#173a61]">
//               No documents require manual review
//             </h2>

//             <p className="mx-auto mt-1 max-w-[400px] text-[9px] leading-relaxed text-slate-400">
//               All documents currently meet the required extraction confidence threshold.
//             </p>
//           </section>
//         )}

//         {/* DOCUMENTS */}
//         {!loading && filteredDocuments.length > 0 && (
//           <section className="mt-5 overflow-hidden rounded-xl border border-[#d8e0eb] bg-white">

//             {/* TABLE HEADER */}
//             <div className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto] items-center gap-4 border-b border-[#e1e6ef] bg-[#f8faff] px-5 py-3 md:grid">
//               {["Document", "Type", "Confidence", "Status", "Action"].map(
//                 (title) => (
//                   <span
//                     key={title}
//                     className="text-[8px] font-bold uppercase tracking-wide text-slate-400"
//                   >
//                     {title}
//                   </span>
//                 )
//               )}
//             </div>

//             {filteredDocuments.map((doc) => {
//               const confidence = getConfidence(doc);
//               const id = doc.id;
//               const filename =
//                 doc.filename ||
//                 doc.file_name ||
//                 "Unnamed document";
//               const type =
//                 doc.doc_type ||
//                 doc.document_type ||
//                 "Unknown";
//               const status =
//                 doc.status ||
//                 "Requires Review";
//               const expanded = expandedId === id;
//               const verifying = verifyingId === id;

//               return (
//                 <div
//                   key={id}
//                   className="border-b border-[#e8ecf2] last:border-b-0"
//                 >
//                   {/* ROW */}
//                   <div className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto] md:items-center md:gap-4">

//                     {/* DOCUMENT */}
//                     <div className="flex min-w-0 items-center gap-3">
//                       <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#edf3fc] text-[#32659b]">
//                         <FileText size={16} />
//                       </div>

//                       <div className="min-w-0">
//                         <p className="truncate text-[10px] font-semibold text-[#173a61]">
//                           {filename}
//                         </p>

//                         {doc.upload_date && (
//                           <p className="mt-0.5 text-[8px] text-slate-400">
//                             Uploaded{" "}
//                             {new Date(
//                               doc.upload_date
//                             ).toLocaleDateString()}
//                           </p>
//                         )}
//                       </div>
//                     </div>

//                     {/* TYPE */}
//                     <div>
//                       <p className="text-[8px] uppercase tracking-wide text-slate-400 md:hidden">
//                         Type
//                       </p>

//                       <p className="text-[10px] text-slate-600">
//                         {type}
//                       </p>
//                     </div>

//                     {/* CONFIDENCE */}
//                     <div>
//                       <p className="text-[8px] uppercase tracking-wide text-slate-400 md:hidden">
//                         Confidence
//                       </p>

//                       <span className="inline-flex rounded-md bg-red-50 px-2 py-1 text-[9px] font-bold text-red-600">
//                         {confidence !== null
//                           ? `${confidence.toFixed(1)}%`
//                           : "Unknown"}
//                       </span>
//                     </div>

//                     {/* STATUS */}
//                     <div>
//                       <p className="text-[8px] uppercase tracking-wide text-slate-400 md:hidden">
//                         Status
//                       </p>

//                       <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[8px] font-semibold text-amber-700">
//                         {status}
//                       </span>
//                     </div>

//                     {/* ACTIONS */}
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => toggleExpanded(id)}
//                         className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#d5deeb] bg-white px-2.5 text-[9px] font-semibold text-[#36516f] transition hover:bg-[#f5f8fc]"
//                       >
//                         {expanded ? (
//                           <ChevronUp size={13} />
//                         ) : (
//                           <Eye size={13} />
//                         )}

//                         {expanded ? "Hide" : "Review"}
//                       </button>

//                       <button
//                         onClick={() => handleVerify(id)}
//                         disabled={verifying}
//                         className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#087443] px-2.5 text-[9px] font-semibold text-white transition hover:bg-[#096138] disabled:cursor-not-allowed disabled:opacity-50"
//                       >
//                         {verifying ? (
//                           <>
//                             <Loader2
//                               size={12}
//                               className="animate-spin"
//                             />
//                             Verifying
//                           </>
//                         ) : (
//                           <>
//                             <CheckCircle2 size={12} />
//                             Verify
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   </div>

//                   {/* EXPANDED REVIEW */}
//                   {expanded && (
//                     <div className="border-t border-[#e8ecf2] bg-[#fbfcfe] px-5 py-4">
//                       <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

//                         {/* DOCUMENT DETAILS */}
//                         <div>
//                           <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
//                             Document Details
//                           </p>

//                           <div className="mt-2 space-y-2 rounded-lg border border-[#e0e6ef] bg-white p-3">
//                             {[
//                               ["Filename", filename],
//                               ["Document Type", type],
//                               [
//                                 "Confidence",
//                                 confidence !== null
//                                   ? `${confidence.toFixed(1)}%`
//                                   : "Unknown",
//                               ],
//                               ["Status", status],
//                             ].map(([label, value]) => (
//                               <div
//                                 key={label}
//                                 className="flex justify-between gap-4"
//                               >
//                                 <span className="text-[9px] text-slate-400">
//                                   {label}
//                                 </span>

//                                 <span
//                                   className={`text-right text-[9px] font-medium ${
//                                     label === "Confidence"
//                                       ? "font-bold text-red-600"
//                                       : "text-slate-600"
//                                   }`}
//                                 >
//                                   {value}
//                                 </span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>

//                         {/* EXTRACTED INFORMATION */}
//                         <div>
//                           <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
//                             Extracted Information
//                           </p>

//                           <div className="mt-2 rounded-lg border border-[#e0e6ef] bg-white p-3">
//                             {doc.summary ? (
//                               <p className="whitespace-pre-wrap text-[9px] leading-relaxed text-slate-600">
//                                 {doc.summary}
//                               </p>
//                             ) : (
//                               <p className="text-[9px] text-slate-400">
//                                 No extracted summary available.
//                               </p>
//                             )}
//                           </div>
//                         </div>

//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </section>
//         )}
// >>>>>>> origin/main
//       </div>
//     </div>
//   );
// }