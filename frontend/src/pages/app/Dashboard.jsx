import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getComplianceStats,
  getRecentActivity,
  getAnalyticsSummary,
} from "../../lib/api";

const distributionColors = [
  "#002D62",
  "#0056B3",
  "#064E3B",
  "#9CA3AF",
  "#7C3AED",
  "#D97706",
];

function timeAgo(timestamp) {
  if (!timestamp) return "";

  const seconds = Math.floor(
    (Date.now() - new Date(timestamp)) / 1000
  );

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days} day${days === 1 ? "" : "s"} ago`;
}

const activityStyles = {
  processed: {
    bg: "bg-[#D1FAE5]",
    text: "text-[#10B981]",
    icon: "✓",
  },

  review_required: {
    bg: "bg-[#FEE2E2]",
    text: "text-[#EF4444]",
    icon: "!",
  },

  risk_detected: {
    bg: "bg-[#FEF3C7]",
    text: "text-[#D97706]",
    icon: "⚠",
  },

  corrected: {
    bg: "bg-[#DBEAFE]",
    text: "text-[#0056B3]",
    icon: "✎",
  },
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [complianceStats, setComplianceStats] =
    useState(null);

  const [activities, setActivities] =
    useState([]);

  const [activitiesLoading, setActivitiesLoading] =
    useState(true);

  const [distribution, setDistribution] =
    useState([]);

  const [hoveredCard, setHoveredCard] =
    useState(null);

  useEffect(() => {
    getComplianceStats()
      .then((res) => {
        setComplianceStats(res.data);
      })
      .catch(console.error);

    getRecentActivity(6)
      .then((res) => {
        setActivities(res.data || []);
      })
      .catch(console.error)
      .finally(() => {
        setActivitiesLoading(false);
      });

    getAnalyticsSummary(30)
      .then((res) => {
        const counts =
          res.data?.doc_type_counts || [];

        const mapped = counts.map(
          (item, idx) => ({
            name: item.type,
            value: item.percentage,
            color:
              distributionColors[
                idx % distributionColors.length
              ],
          })
        );

        setDistribution(mapped);
      })
      .catch(console.error);
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
      "#EF4444",
    ],
  ];

  return (
    <main className="min-h-full bg-[#fafbff] p-5">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="mb-6">
        <h1 className="text-[30px] font-bold tracking-tight text-[#111827]">
          Welcome back, Administrator.
        </h1>

        <p className="mt-1 text-[15px] text-[#1E293B]/65">
          Overview of document intelligence activities.
        </p>
      </div>

      {/* ===================================================== */}
      {/* STATS */}
      {/* ===================================================== */}

      <div className="mb-4 grid grid-cols-4 gap-3">
        {stats.map(
          ([title, value, extra, color]) => (
            <div
              key={title}
              onMouseEnter={() =>
                setHoveredCard(title)
              }
              onMouseLeave={() =>
                setHoveredCard(null)
              }
              className={`
                h-[110px]
                rounded-xl
                border
                border-[#E5E7EB]
                bg-white
                px-4
                py-3
                shadow-sm
                transition-all
                duration-300
                ease-out
                ${
                  hoveredCard === title
                    ? "z-10 scale-[1.08] shadow-lg"
                    : hoveredCard
                    ? "scale-[0.96] opacity-80"
                    : ""
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="text-center text-[14px] font-bold text-[#1E293B]/70">
                  {title}
                </span>

                <span
                  className="text-[13px]"
                  style={{ color }}
                >
                  ▤
                </span>
              </div>

              <div className="mt-2 flex items-end gap-2">
                <span
                  className={`
                    font-bold
                    leading-none
                    text-[#111827]
                    ${
                      value === "Healthy"
                        ? "text-[22px]"
                        : "text-[25px]"
                    }
                  `}
                >
                  {value}
                </span>

                {extra && (
                  <span
                    className={`
                      text-[8px]
                      ${
                        title === "PENDING REVIEWS"
                          ? "text-[#EF4444]"
                          : "text-[#10B981]"
                      }
                    `}
                  >
                    {extra}
                  </span>
                )}
              </div>
            </div>
          )
        )}
      </div>

      {/* ===================================================== */}
      {/* MAIN CONTENT */}
      {/* ===================================================== */}

      <div className="grid grid-cols-[minmax(0,1fr)_250px] gap-4">

        {/* =================================================== */}
        {/* RECENT ACTIVITY */}
        {/* =================================================== */}

        <section className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">

          <div className="flex h-11 items-center justify-between border-b border-[#E5E7EB] px-4">
            <h2 className="text-[18px] font-bold text-[#111827]">
              Recent Activity
            </h2>

            <button
              type="button"
              onClick={() => navigate("/analytics")}
              className="text-[13px] font-semibold text-[#0056B3] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="px-4">

            {/* LOADING */}

            {activitiesLoading && (
              <div className="space-y-3 py-4">
                {Array.from({ length: 3 }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className="h-12 animate-pulse rounded bg-slate-100"
                    />
                  )
                )}
              </div>
            )}

            {/* EMPTY */}

            {!activitiesLoading &&
              activities.length === 0 && (
                <div className="py-10 text-center text-[11px] text-[#1E293B]/50">
                  No recent activity yet.
                  Upload a document to get
                  started.
                </div>
              )}

            {/* ACTIVITY LIST */}

            {!activitiesLoading &&
              activities.map(
                (activity, idx) => {
                  const style =
                    activityStyles[
                      activity.type
                    ] ||
                    activityStyles.processed;

                  const isLast =
                    idx === activities.length - 1;

                  const isCorrected =
                    activity.type === "corrected";

                  return (
                    <div
                      key={
                        activity.id ||
                        `${activity.type}-${idx}`
                      }
                      className={`
                        flex
                        min-w-0
                        gap-3
                        py-4
                        ${
                          isLast
                            ? ""
                            : "border-b border-[#E5E7EB]"
                        }
                      `}
                    >

                      {/* ICON */}

                      <div
                        className={`
                          flex
                          h-7
                          w-7
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          text-[12px]
                          ${style.bg}
                          ${style.text}
                        `}
                      >
                        {style.icon}
                      </div>

                      {/* CONTENT */}

                      <div className="min-w-0 flex-1">

                        {/* MESSAGE */}

                        <p className="break-words text-[14px] font-medium leading-5 text-[#111827]">
                          {activity.message}
                        </p>

                        {/* CORRECTION DETAIL */}

                        {activity.detail &&
                          isCorrected && (
                            <div
                              className="
                                mt-2
                                max-w-full
                                rounded-xl
                                bg-[#DBEAFE]
                                px-3
                                py-2
                                text-[11px]
                                font-medium
                                leading-[1.55]
                                text-[#0056B3]
                                break-words
                                whitespace-normal
                              "
                            >
                              {activity.detail}
                            </div>
                          )}

                        {/* NORMAL DETAIL */}

                        {activity.detail &&
                          !isCorrected && (
                            <span
                              className={`
                                mt-1
                                inline-flex
                                max-w-full
                                rounded-full
                                px-2
                                py-0.5
                                text-[8px]
                                font-medium
                                ${style.bg}
                                ${style.text}
                              `}
                            >
                              <span className="truncate">
                                {activity.detail}
                              </span>
                            </span>
                          )}

                        {/* TIMESTAMP */}

                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[9px] text-[#1E293B]/50">
                            ◷{" "}
                            {timeAgo(
                              activity.timestamp
                            )}
                          </span>
                        </div>

                      </div>
                    </div>
                  );
                }
              )}
          </div>
        </section>

        {/* =================================================== */}
        {/* RIGHT COLUMN */}
        {/* =================================================== */}

        <div className="space-y-4">

          {/* ================================================= */}
          {/* QUICK ACTIONS */}
          {/* ================================================= */}

          <section className="rounded-lg bg-[#002D62] p-4 text-white">

            <h2 className="mb-2 text-center text-[14px] font-bold">
              Quick Actions
            </h2>

            <div className="grid grid-cols-2 gap-2">

              {/* UPLOAD NEW */}

              <button
                type="button"
                onClick={() => navigate("/upload")}
                className="
                  h-12
                  rounded-md
                  bg-white/10
                  text-[10px]
                  font-medium
                  transition
                  hover:bg-white/20
                "
              >
                <div className="mb-1 text-[14px]">
                  ↥
                </div>

                Upload New
              </button>

              {/* SEARCH DOCUMENTS */}

              <button
                type="button"
                onClick={() => navigate("/documents")}
                className="
                  h-12
                  rounded-md
                  bg-white/10
                  text-[10px]
                  font-medium
                  transition
                  hover:bg-white/20
                "
              >
                <div className="mb-1 text-[14px]">
                  ⌕
                </div>

                Search Docs
              </button>

            </div>
          </section>

          {/* ================================================= */}
          {/* DOCUMENT DISTRIBUTION */}
          {/* ================================================= */}

          <section className="rounded-lg border border-[#E5E7EB] bg-white p-4">

            <h2 className="mb-4 text-center text-[16px] font-bold text-[#111827]">
              Document Distribution
            </h2>

            {distribution.length === 0 ? (
              <p className="text-center text-[9px] text-[#1E293B]/50">
                No documents processed yet.
              </p>
            ) : (
              <div className="space-y-3">

                {distribution.map(
                  ({
                    name,
                    value,
                    color,
                  }) => (
                    <div key={name}>

                      <div className="mb-1 flex justify-between gap-2">

                        <span className="min-w-0 truncate text-[8px] text-[#1E293B]">
                          <span
                            className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor:
                                color,
                            }}
                          />

                          {name}
                        </span>

                        <span className="shrink-0 text-[8px] text-[#1E293B]/60">
                          {value}%
                        </span>

                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${value}%`,
                            backgroundColor:
                              color,
                          }}
                        />
                      </div>

                    </div>
                  )
                )}

              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}