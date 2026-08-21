import {
  UploadCloud,
  Check,
  FileText,
  FileImage,
  ExternalLink,
} from "lucide-react";
import axios from "axios";

const recentUploads = [
  {
    name: "Station_Report_01.pdf",
    date: "Today, 10:42 AM",
    size: "2.4 MB",
    status: "Processed",
    type: "pdf",
  },
  {
    name: "Tender_Ref_402.jpg",
    date: "Yesterday, 03:15 PM",
    size: "1.1 MB",
    status: "Processed",
    type: "image",
  },
  {
    name: "Contract_A_V2.pdf",
    date: "Oct 12, 2023",
    size: "5.6 MB",
    status: "Success",
    type: "pdf",
  },
];

function Upload() {
  const handleFileChange = async (event) => {
  const file = event.target.files[0];

  if (!file) return;

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      "http://127.0.0.1:8000/documents/upload",
      formData
    );

    console.log("Upload successful:", response.data);
  } catch (error) {
    console.error("Upload failed:", error);
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

        {/* Processed Documents */}
        <div className="flex h-[38px] items-center gap-2 rounded-md border border-slate-200 bg-white px-3">
          <div>
            <p className="text-[7px] font-medium uppercase tracking-wide text-slate-500">
              Processed
            </p>

            <p className="text-[11px] font-bold leading-3 text-[#003b73]">
              11,936{" "}
              <span className="font-medium text-slate-600">documents</span>
            </p>
          </div>

          <Check
            size={13}
            strokeWidth={2.5}
            className="text-[#00766f]"
          />
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
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Upload Icon */}
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4ff]">
          <UploadCloud
            size={23}
            strokeWidth={1.8}
            className="text-[#0056a6]"
          />
        </div>

        <h2 className="text-[14px] font-semibold text-[#062f5c]">
          Upload your document
        </h2>

        <p className="mt-1 text-[10px] text-slate-500">
          Drag and drop a PDF, scanned document, or image here
        </p>

        {/* Browse Button */}
        <span className="mt-4 rounded-md bg-[#003b73] px-5 py-2 text-[10px] font-semibold text-white shadow-sm transition group-hover:bg-[#064b8c]">
          Browse Files
        </span>

        <p className="mt-2.5 text-[8px] text-slate-400">
          PDF • PNG • JPG • JPEG (Max 25MB)
        </p>
      </label>

      {/* Recent Uploads */}
      <section className="mt-4 overflow-hidden rounded-md border border-slate-200 bg-white">
        {/* Section Header */}
        <div className="flex h-[39px] items-center justify-between border-b border-slate-200 bg-[#fafbff] px-3.5">
          <h2 className="text-[10px] font-semibold text-[#062f5c]">
            Recent Uploads
          </h2>

          <button className="text-[8px] font-medium text-[#0056a6] hover:underline">
            VIEW ALL
          </button>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[1.7fr_1fr_0.55fr_0.7fr_0.35fr] border-b border-slate-200 bg-[#fcfcfd] px-3.5 py-2">
          <span className="text-[7px] font-medium uppercase tracking-wide text-slate-500">
            Document Name
          </span>

          <span className="text-[7px] font-medium uppercase tracking-wide text-slate-500">
            Date Uploaded
          </span>

          <span className="text-[7px] font-medium uppercase tracking-wide text-slate-500">
            Size
          </span>

          <span className="text-[7px] font-medium uppercase tracking-wide text-slate-500">
            Status
          </span>

          <span className="text-[7px] font-medium uppercase tracking-wide text-slate-500">
            Actions
          </span>
        </div>

        {/* Rows */}
        {recentUploads.map((file) => (
          <div
            key={file.name}
            className="grid min-h-[41px] grid-cols-[1.7fr_1fr_0.55fr_0.7fr_0.35fr] items-center border-b border-slate-200 px-3.5 last:border-b-0"
          >
            {/* Document */}
            <div className="flex items-center gap-2">
              {file.type === "pdf" ? (
                <FileText
                  size={14}
                  strokeWidth={1.8}
                  className="text-red-500"
                />
              ) : (
                <FileImage
                  size={14}
                  strokeWidth={1.8}
                  className="text-blue-500"
                />
              )}

              <span className="text-[9px] font-medium text-[#173a61]">
                {file.name}
              </span>
            </div>

            {/* Date */}
            <span className="text-[8px] text-slate-500">
              {file.date}
            </span>

            {/* Size */}
            <span className="text-[8px] text-slate-500">
              {file.size}
            </span>

            {/* Status */}
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f0ed] px-2 py-0.5 text-[7px] font-medium text-[#315b50]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#40806d]" />
                {file.status}
              </span>
            </div>

            {/* Action */}
            <button className="flex items-center justify-center text-slate-500 hover:text-[#0056a6]">
              <ExternalLink size={12} strokeWidth={1.8} />
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Upload;