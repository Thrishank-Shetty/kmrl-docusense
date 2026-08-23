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
      .catch((err) => console.error(err));
  }, []);

  const stats = [
    [
      "TOTAL DOCUMENTS PROCESSED",
      complianceStats?.total_documents ?? "—",
      "",
      "#0056B3",
    ],
    [
      "CRITICAL RISKS",
      complianceStats?.critical ?? "—",
      "Action required",
      "#EF4444",
    ],
    [
      "DUE IN 7 DAYS",
      complianceStats?.upcoming_7_days ?? "—",
      "",
      "#0056B3",
    ],
    [
      "OVERDUE",
      complianceStats?.overdue ?? "—",
      "",
      "#EF4444"
    ],
  ];

  return (
    <main className="min-h-full bg-[#DCEBFA] p-5">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight text-[#111827]">
            Welcome back, Administrator.
          </h1>

          <p className="text-[15px] text-[#1E293B]/65 mt-1">
            Overview of document intelligence activities.
          </p>
        </div>

        <button
          className="
            px-5 h-11
            rounded-lg
            bg-[#002D62]
            hover:bg-[#0056B3]
            text-white text-[12px] font-bold
            transition
          "
        >
         <b> +</b>&nbsp;Upload Documents
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {stats.map(([title, value, extra, color]) => (
          <div
            key={title}
            onMouseEnter={() => setHoveredCard(title)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`
              h-[110px]
              bg-white
              border border-[#E5E7EB]
              shadow-sm
              rounded-xl
              px-4 py-3
              transition-all duration-300 ease-out
              ${hoveredCard === title ? "scale-[1.08] shadow-lg z-10" : hoveredCard ? "scale-[0.96] opacity-80" : ""}
            `}
          >
            <div className="flex justify-between items-center">
              <span className="text-[14px] font-bold text-center text-[#1E293B]/70">
                {title}
              </span>

              <span
                className="text-[13px]"
                style={{ color }}
              >
                ▤
              </span>
            </div>

            <div className="flex items-end gap-2 mt-2">
              <span
                className={`font-bold text-[#111827] leading-none ${
                  value === "Healthy"
                    ? "text-[22px]"
                    : "text-[25px]"
                }`}
              >
                {value}
              </span>

              {extra && (
                <span
                  className={`text-[8px] ${
                    title === "PENDING REVIEWS"
                      ? "text-[#EF4444]"
                      : title === "SYSTEM STATUS"
                      ? "text-[#10B981]"
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

      {/* Main Content */}
      <div className="grid grid-cols-[minmax(0,1fr)_250px] gap-4">

        {/* Recent Activity */}
        <section
          className="
            bg-white
            border border-[#E5E7EB]
            rounded-lg
            overflow-hidden
          "
        >
          <div
            className="
              h-11
              px-4
              flex items-center justify-between
              border-b border-[#E5E7EB]
            "
          >
            <h2 className="text-[18px] font-bold text-[#111827]">
              Recent Activity
            </h2>

            <button className="text-[13px] font-semibold hover:underline text-[#0056B3]">
              View All
            </button>
          </div>

          <div className="px-4">

            {/* Activity 1 */}
            <div className="flex gap-3 py-4 border-b border-[#E5E7EB]">
              <div
                className="
                  w-7 h-7 shrink-0
                  rounded-full
                  bg-[#D1FAE5]
                  text-[#10B981]
                  flex items-center justify-center
                  text-[12px]
                "
              >
                ✓
              </div>

              <div>
                <p className="text-[14px] font-medium text-[#111827]">
                  Safety_Manual_V2.pdf successfully analyzed.
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="
                      px-2 py-0.5
                      rounded-full
                      bg-[#D1FAE5]
                      text-[#10B981]
                      text-[7px]
                    "
                  >
                    High Confidence
                  </span>

                  <span className="text-[8px] text-[#1E293B]/50">
                    ◷ 2 mins ago
                  </span>
                </div>
              </div>
            </div>

            {/* Activity 2 */}
            <div className="flex gap-3 py-4 border-b border-[#E5E7EB]">
              <div
                className="
                  w-7 h-7 shrink-0
                  rounded-full
                  bg-[#FEE2E2]
                  text-[#EF4444]
                  flex items-center justify-center
                  text-[12px]
                "
              >
                !
              </div>

              <div>
                <p className="text-[10px] text-[#111827]">
                  Tender_Ref_402.pdf flagged for manual review.
                </p>

                <p className="text-[8px] text-[#EF4444] mt-1">
                  Discrepancy found in 'Total Value' field.
                </p>

                <p className="text-[8px] text-[#1E293B]/50 mt-1">
                  ◷ 15 mins ago
                </p>
              </div>
            </div>

            {/* Activity 3 */}
            <div className="flex gap-3 py-4">
              <div
                className="
                  w-7 h-7 shrink-0
                  rounded-full
                  bg-[#DBEAFE]
                  text-[#0056B3]
                  flex items-center justify-center
                  text-[12px]
                "
              >
                ↻
              </div>

              <div className="flex-1">
                <p className="text-[10px] text-[#111827]">
                  Batch processing started: Q3_Financial_Reports (45 files)
                </p>

                <p className="text-[8px] text-[#1E293B]/50 mt-1">
                  ◷ 1 hr ago
                </p>

                <div className="mt-2">
                  <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-[#0056B3] rounded-full" />
                  </div>

                  <div className="flex justify-between mt-1">
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

        {/* Right Column */}
        <div className="space-y-4">

          {/* Quick Actions */}
          <section
            className="
              bg-[#002D62]
              rounded-lg
              p-4
              text-white
            "
          >
            <h2 className="text-[14px] text-center font-bold mb-2">
              Quick Actions
            </h2>

            <div className="grid grid-cols-2 gap-2">
              <button
                className="
                  h-12 rounded-md
                  bg-white/10 hover:bg-white/20
                  text-[10px] font-medium
                "
              >
                <div className="text-[14px] mb-1">↥</div>
                Upload New
              </button>

              <button
                className="
                  h-12 rounded-md
                  bg-white/10 hover:bg-white/20
                  text-[10px] font-medium
                "
              >
                <div className="text-[14px] mb-1">⌕</div>
                Search Docs
              </button>

              <button
                className="
                  col-span-2 h-12
                  rounded-md
                  bg-white/10 hover:bg-white/20
                  text-[10px] font-medium
                "
              >
                <div className="text-[14px] mb-1">▣</div>
                Generate Report
              </button>
            </div>
          </section>

          {/* Distribution */}
          <section
            className="
              bg-white
              border border-[#E5E7EB]
              rounded-lg
              p-4
            "
          >
            <h2 className="text-[16px] font-bold text-[#111827] text-center mb-4">
              Document Distribution
            </h2>

            <div className="space-y-3">
              {distribution.map(([name, value, color]) => (
                <div key={name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[8px] text-[#1E293B]">
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                        style={{ backgroundColor: color }}
                      />
                      {name}
                    </span>

                    <span className="text-[8px] text-[#1E293B]/60">
                      {value}%
                    </span>
                  </div>

                  <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
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

          {/* Storage */}
          <section
            className="
              bg-white
              border border-[#E5E7EB]
              rounded-lg
              p-4
            "
          >
            <div className="flex justify-between">
              <h2 className="text-[11px] font-semibold text-[#111827]">
                Storage Usage
              </h2>

              <span className="text-[#64748B]">
                ♧
              </span>
            </div>

            <p className="text-[13px] font-semibold text-[#111827] mt-3">
              1.2 TB
              <span className="text-[8px] font-normal text-[#1E293B]/50">
                {" "} / 5.0 TB
              </span>
            </p>

            <div className="h-1.5 bg-[#E5E7EB] rounded-full mt-2">
              <div className="h-full w-[24%] bg-[#002D62] rounded-full" />
            </div>

            <p className="text-right text-[7px] text-[#1E293B]/50 mt-2">
              24% Used
            </p>
          </section>

        </div>
      </div>

    </main>
  );
}