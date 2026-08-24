import { useEffect, useState } from "react";
import { getComplianceStats } from "../../lib/api";

const distribution = [
  ["Technical Specs", 45, "#002D62"],
  ["Safety Manuals", 25, "#0056B3"],
  ["Financial Records", 20, "#064E3B"],
  ["Legal Contracts", 10, "#9CA3AF"],
];

export default function Dashboard() {
  const [complianceStats, setComplianceStats] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    getComplianceStats()
      .then((res) => setComplianceStats(res.data))
      .catch(console.error);
  }, []);

  const stats = [
    ["TOTAL DOCUMENTS PROCESSED", complianceStats?.total_documents ?? "—", "", "#0056B3"],
    ["CRITICAL RISKS", complianceStats?.critical ?? "—", "Action required", "#EF4444"],
    ["DUE IN 7 DAYS", complianceStats?.upcoming_7_days ?? "—", "", "#0056B3"],
    ["OVERDUE", complianceStats?.overdue ?? "—", "", "#EF4444"],
  ];

  return (
    <main className="min-h-full bg-[#DCEBFA] p-5">
      {/* HEADER */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight text-[#111827]">
            Welcome back, Administrator.
          </h1>
          <p className="mt-1 text-[15px] text-[#1E293B]/65">
            Overview of document intelligence activities.
          </p>
        </div>

        <button className="h-11 rounded-lg bg-[#002D62] px-5 text-[12px] font-bold text-white transition hover:bg-[#0056B3]">
          <b>+</b>&nbsp;Upload Documents
        </button>
      </div>

      {/* STATS */}
      <div className="mb-4 grid grid-cols-4 gap-3">
        {stats.map(([title, value, extra, color]) => (
          <div
            key={title}
            onMouseEnter={() => setHoveredCard(title)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`h-[110px] rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm transition-all duration-300 ease-out ${
              hoveredCard === title
                ? "z-10 scale-[1.08] shadow-lg"
                : hoveredCard
                ? "scale-[0.96] opacity-80"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-center text-[14px] font-bold text-[#1E293B]/70">
                {title}
              </span>
              <span className="text-[13px]" style={{ color }}>
                ▤
              </span>
            </div>

            <div className="mt-2 flex items-end gap-2">
              <span
                className={`font-bold leading-none text-[#111827] ${
                  value === "Healthy" ? "text-[22px]" : "text-[25px]"
                }`}
              >
                {value}
              </span>

              {extra && (
                <span
                  className={`text-[8px] ${
                    title === "PENDING REVIEWS"
                      ? "text-[#EF4444]"
                      : "text-[#10B981]"
                  }`}
                >
                  {extra}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-[minmax(0,1fr)_250px] gap-4">
        {/* RECENT ACTIVITY */}
        <section className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
          <div className="flex h-11 items-center justify-between border-b border-[#E5E7EB] px-4">
            <h2 className="text-[18px] font-bold text-[#111827]">
              Recent Activity
            </h2>
            <button className="text-[13px] font-semibold text-[#0056B3] hover:underline">
              View All
            </button>
          </div>

          <div className="px-4">
            {/* ACTIVITY 1 */}
            <div className="flex gap-3 border-b border-[#E5E7EB] py-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D1FAE5] text-[12px] text-[#10B981]">
                ✓
              </div>

              <div>
                <p className="text-[14px] font-medium text-[#111827]">
                  Safety_Manual_V2.pdf successfully analyzed.
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-[#D1FAE5] px-2 py-0.5 text-[7px] text-[#10B981]">
                    High Confidence
                  </span>
                  <span className="text-[8px] text-[#1E293B]/50">
                    ◷ 2 mins ago
                  </span>
                </div>
              </div>
            </div>

            {/* ACTIVITY 2 */}
            <div className="flex gap-3 border-b border-[#E5E7EB] py-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2] text-[12px] text-[#EF4444]">
                !
              </div>

              <div>
                <p className="text-[10px] text-[#111827]">
                  Tender_Ref_402.pdf flagged for manual review.
                </p>
                <p className="mt-1 text-[8px] text-[#EF4444]">
                  Discrepancy found in 'Total Value' field.
                </p>
                <p className="mt-1 text-[8px] text-[#1E293B]/50">
                  ◷ 15 mins ago
                </p>
              </div>
            </div>

            {/* ACTIVITY 3 */}
            <div className="flex gap-3 py-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-[12px] text-[#0056B3]">
                ↻
              </div>

              <div className="flex-1">
                <p className="text-[10px] text-[#111827]">
                  Batch processing started: Q3_Financial_Reports (45 files)
                </p>

                <p className="mt-1 text-[8px] text-[#1E293B]/50">
                  ◷ 1 hr ago
                </p>

                <div className="mt-2">
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
                    <div className="h-full w-[45%] rounded-full bg-[#0056B3]" />
                  </div>

                  <div className="mt-1 flex justify-between">
                    <span className="text-[7px] text-[#1E293B]/50">
                      ◷ 1 hr ago
                    </span>
                    <span className="text-[7px] text-[#1E293B]/50">
                      45% Complete
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          {/* QUICK ACTIONS */}
          <section className="rounded-lg bg-[#002D62] p-4 text-white">
            <h2 className="mb-2 text-center text-[14px] font-bold">
              Quick Actions
            </h2>

            <div className="grid grid-cols-2 gap-2">
              <button className="h-12 rounded-md bg-white/10 text-[10px] font-medium hover:bg-white/20">
                <div className="mb-1 text-[14px]">↥</div>
                Upload New
              </button>

              <button className="h-12 rounded-md bg-white/10 text-[10px] font-medium hover:bg-white/20">
                <div className="mb-1 text-[14px]">⌕</div>
                Search Docs
              </button>

              <button className="col-span-2 h-12 rounded-md bg-white/10 text-[10px] font-medium hover:bg-white/20">
                <div className="mb-1 text-[14px]">▣</div>
                Generate Report
              </button>
            </div>
          </section>

          {/* DISTRIBUTION */}
          <section className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <h2 className="mb-4 text-center text-[16px] font-bold text-[#111827]">
              Document Distribution
            </h2>

            <div className="space-y-3">
              {distribution.map(([name, value, color]) => (
                <div key={name}>
                  <div className="mb-1 flex justify-between">
                    <span className="text-[8px] text-[#1E293B]">
                      <span
                        className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      {name}
                    </span>

                    <span className="text-[8px] text-[#1E293B]/60">
                      {value}%
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${value}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* STORAGE */}
          <section className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <div className="flex justify-between">
              <h2 className="text-[11px] font-semibold text-[#111827]">
                Storage Usage
              </h2>
              <span className="text-[#64748B]">♧</span>
            </div>

            <p className="mt-3 text-[13px] font-semibold text-[#111827]">
              1.2 TB
              <span className="text-[8px] font-normal text-[#1E293B]/50">
                {" "} / 5.0 TB
              </span>
            </p>

            <div className="mt-2 h-1.5 rounded-full bg-[#E5E7EB]">
              <div className="h-full w-[24%] rounded-full bg-[#002D62]" />
            </div>

            <p className="mt-2 text-right text-[7px] text-[#1E293B]/50">
              24% Used
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}