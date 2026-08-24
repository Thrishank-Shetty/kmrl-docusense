import { useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Download,
  FileText,
  Filter,
  Gavel,
  MoreVertical,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Clock3,
  RefreshCw,
} from "lucide-react";
import { getAnalyticsSummary } from "../../lib/api";
import { useToast } from "../../components/common/useToast";

const icons = {
  file: FileText,
  confidence: Check,
  time: Clock3,
  review: Gavel,
};

const colors = [
  "#0c2244",
  "#1369c6",
  "#50d5a4",
  "#f5b94c",
  "#8b5cf6",
  "#ef6c6c",
];

export default function Analytics() {
  const { showToast } = useToast();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [range, setRange] = useState("Last 30 Days");
  const [rangeOpen, setRangeOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchAnalytics = async () => {
      try {
        const { data } = await getAnalyticsSummary();

        if (!cancelled) {
          setAnalytics(data);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
              "Failed to load analytics."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshAnalytics = async () => {
    setRefreshing(true);
    setError(null);

    try {
      const { data } = await getAnalyticsSummary();

      setAnalytics(data);
      showToast("Analytics refreshed");
    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.detail ||
        "Failed to refresh analytics.";

      setError(message);
      showToast(message, "error");
    } finally {
      setRefreshing(false);
    }
  };

  const exportReport = () => {
    setExported(true);

    setTimeout(() => {
      setExported(false);
    }, 2200);

    showToast(
      "Report export will be available soon.",
      "info"
    );
  };

  const getUrgencyClass = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case "critical":
        return "bg-red-50 text-red-600";
      case "high":
        return "bg-orange-50 text-orange-600";
      case "medium":
        return "bg-yellow-50 text-yellow-600";
      default:
        return "bg-green-50 text-green-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fd] px-7 py-6">
        <div className="mx-auto max-w-[1110px]">
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />

          <div className="mt-2 h-4 w-96 animate-pulse rounded bg-slate-200" />

          <div className="mt-6 grid grid-cols-4 gap-5 max-[720px]:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[116px] animate-pulse rounded-lg border border-slate-200 bg-white"
              />
            ))}
          </div>

          <div className="mt-5 grid grid-cols-[2.1fr_1.1fr] gap-5 max-[960px]:grid-cols-1">
            <div className="h-[340px] animate-pulse rounded-lg border border-slate-200 bg-white" />
            <div className="h-[340px] animate-pulse rounded-lg border border-slate-200 bg-white" />
          </div>

          <div className="mt-5 h-[300px] animate-pulse rounded-lg border border-slate-200 bg-white" />
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-[#f7f9fd] px-7 py-6">
        <div className="mx-auto max-w-[1110px]">
          <h1 className="text-[30px] font-bold text-[#10264c]">
            Analytics Overview
          </h1>

          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={20}
                className="mt-0.5 text-red-500"
              />

              <div>
                <p className="text-[12px] font-bold text-red-800">
                  Unable to load analytics
                </p>

                <p className="mt-1 text-[10px] text-red-700">
                  {error || "No analytics data available."}
                </p>

                <button
                  onClick={refreshAnalytics}
                  disabled={refreshing}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-[9px] font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  <RefreshCw
                    size={12}
                    className={
                      refreshing ? "animate-spin" : ""
                    }
                  />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const kpis = [
    [
      "Total Processed",
      analytics.total_processed ?? 0,
      null,
      "file",
      true,
    ],
    [
      "Compliance Score",
      `${analytics.compliance_score ?? 0}%`,
      null,
      "confidence",
      true,
    ],
    [
      "Documents This Week",
      analytics.documents_this_week ?? 0,
      null,
      "time",
      true,
    ],
    [
      "Manual Review Required",
      analytics.manual_review_required ?? 0,
      null,
      "review",
      false,
    ],
  ];

  const documentTypes =
    analytics.doc_type_counts || [];

  const urgencyCounts =
    analytics.urgency_counts || [];

  // Backend returns volume_by_period
  const volumeByPeriod =
    analytics.volume_by_period || [];

  const maxVolume = Math.max(
    ...volumeByPeriod.map(
      (item) => Number(item.count) || 0
    ),
    1
  );

  const maxUrgency = Math.max(
    ...urgencyCounts.map(
      (item) => Number(item.count) || 0
    ),
    1
  );

  return (
    <div className="min-h-screen bg-[#f7f9fd] text-[#13213a]">
      <main className="mx-auto max-w-[1110px] px-7 pb-[26px] max-[960px]:px-5 max-[720px]:px-4">
        {/* HEADER */}
        <section className="flex items-end justify-between gap-6 py-[2px] pb-[21px] max-[720px]:block max-[720px]:pt-[19px]">
          <div>
            <h1 className="text-[30px] leading-[1.14] tracking-[-.9px] text-[#10264c] max-[430px]:text-[26px]">
              <b>Analytics Overview</b>
            </h1>

            <p className="mt-2 text-[13px] text-[#4d5868] max-[430px]:text-[12px]">
              Deep insights into extraction trends and operational
              efficiency.
            </p>
          </div>

          <div className="mt-[17px] flex gap-[13px]">
            {/* RANGE */}
            <div className="relative">
              <button
                onClick={() =>
                  setRangeOpen(!rangeOpen)
                }
                className="flex h-[38px] items-center gap-2 rounded-[7px] border border-[#9aa6b8] bg-white px-[13px] text-[13px] font-bold"
              >
                <CalendarDays size={18} />

                {range}

                <ChevronDown
                  size={16}
                  className={
                    rangeOpen
                      ? "rotate-180"
                      : ""
                  }
                />
              </button>

              {rangeOpen && (
                <div className="absolute right-0 top-[44px] z-20 min-w-[158px] rounded-lg border border-[#cbd4e2] bg-white p-[5px] shadow-lg">
                  {[
                    "Last 7 Days",
                    "Last 30 Days",
                    "Last 90 Days",
                  ].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setRange(option);
                        setRangeOpen(false);

                        if (
                          option !==
                          "Last 30 Days"
                        ) {
                          showToast(
                            "The backend currently provides 30-day analytics.",
                            "info"
                          );
                        }
                      }}
                      className="flex w-full justify-between px-[10px] py-[9px] text-left text-[12px] hover:bg-[#edf4ff]"
                    >
                      {option}

                      {range === option && (
                        <Check size={15} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* REFRESH */}
            <button
              onClick={refreshAnalytics}
              disabled={refreshing}
              className="flex h-[38px] items-center gap-2 rounded-[7px] border border-[#142f59] bg-white px-[13px] text-[13px] font-bold disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            {/* EXPORT */}
            <button
              onClick={exportReport}
              className="flex h-[38px] items-center gap-2 rounded-[7px] border border-[#142f59] bg-white px-[13px] text-[13px] font-bold"
            >
              <Download size={17} />

              {exported
                ? "Report Ready"
                : "Export Report"}
            </button>
          </div>
        </section>

        {/* KPI CARDS */}
        <section className="mb-5 grid grid-cols-4 gap-5 max-[960px]:gap-3 max-[720px]:grid-cols-2">
          {kpis.map(
            ([
              label,
              value,
              change,
              icon,
              positive,
            ]) => {
              const Icon = icons[icon];

              const good =
                positive ||
                change?.startsWith("-");

              const Trend = good
                ? TrendingUp
                : TrendingDown;

              return (
                <article
                  key={label}
                  className="min-h-[116px] rounded-lg border border-[#cbd2df] bg-white p-[15px_14px_13px] max-[720px]:min-h-[121px] max-[430px]:px-[11px]"
                >
                  <div className="mb-[17px] flex justify-between text-[11px] font-semibold text-[#4e5662]">
                    {label}

                    <span className="text-[#0861c7]">
                      <Icon size={19} />
                    </span>
                  </div>

                  <strong className="block text-[25px] leading-none text-[#14213a] max-[430px]:text-[22px]">
                    {value}
                  </strong>

                  {change ? (
                    <div
                      className={`mt-[9px] flex items-center gap-1 text-[10px] ${
                        good
                          ? "text-[#27c69a]"
                          : "text-[#db3d45]"
                      }`}
                    >
                      <Trend size={14} />
                      <b>{change}</b>

                      <span className="text-[#4f596a]">
                        vs last month
                      </span>
                    </div>
                  ) : (
                    <div className="mt-[9px] text-[9px] text-[#7b8493]">
                      Current system value
                    </div>
                  )}
                </article>
              );
            }
          )}
        </section>

        {/* CHARTS */}
        <section className="mb-5 grid grid-cols-[2.1fr_1.1fr] gap-5 max-[960px]:grid-cols-1 max-[720px]:gap-3">
          {/* VOLUME BAR CHART */}
          <div className="relative rounded-lg border border-[#cbd2df] bg-white p-5">
            <div className="mb-[18px] flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-[#15233b]">
                  Extraction Volume Trends
                </h2>

                <p className="mt-1 text-[9px] text-slate-400">
                  Documents processed over the selected period.
                </p>
              </div>

              <button
                onClick={() =>
                  setMenuOpen(!menuOpen)
                }
                className="text-slate-500 hover:text-slate-800"
              >
                <MoreVertical size={19} />
              </button>
            </div>

            {menuOpen && (
              <div className="absolute right-5 top-[68px] z-10 min-w-[158px] rounded-lg border bg-white p-1 shadow-lg">
                <button className="w-full p-2 text-left text-xs hover:bg-[#edf4ff]">
                  View details
                </button>

                <button className="w-full p-2 text-left text-xs hover:bg-[#edf4ff]">
                  Compare period
                </button>
              </div>
            )}

            {volumeByPeriod.length ===
            0 ? (
              <div className="grid h-[224px] place-items-center rounded-[7px] border border-[#d4dced] bg-[#f0f3fd] text-[10px] text-slate-400">
                No volume data available.
              </div>
            ) : (
              <div className="relative h-[224px] overflow-hidden rounded-[7px] border border-[#d4dced] bg-[#f0f3fd] px-4 pb-8 pt-5">
                {/* GRID */}
                <div className="absolute inset-[19px_14px_32px] flex flex-col justify-between">
                  {[1, 2, 3, 4].map(
                    (i) => (
                      <span
                        key={i}
                        className="h-px bg-[#dbe2f0]"
                      />
                    )
                  )}
                </div>

                {/* BARS */}
                <div className="absolute inset-[22px_14px_30px] flex items-end gap-[7px]">
                  {volumeByPeriod.map(
                    (item) => {
                      const count =
                        Number(
                          item.count
                        ) || 0;

                      const height =
                        Math.max(
                          (count /
                            maxVolume) *
                            100,
                          5
                        );

                      const key =
                        item.date ||
                        item.week_start ||
                        item.period;

                      return (
                        <div
                          key={key}
                          className="group relative flex h-full flex-1 items-end"
                        >
                          <div
                            className="w-full rounded-t-[4px] bg-[#214f82] transition hover:bg-[#1262c2]"
                            style={{
                              height: `${height}%`,
                            }}
                            title={`${item.period}: ${count}`}
                          />
                        </div>
                      );
                    }
                  )}
                </div>

                {/* LABELS */}
                <div className="absolute bottom-[6px] left-[14px] right-[14px] flex justify-between gap-2 overflow-hidden text-[8px] text-[#7d8796]">
                  {volumeByPeriod.map(
                    (item) => (
                      <span
                        key={
                          item.date ||
                          item.week_start ||
                          item.period
                        }
                        className="min-w-0 flex-1 truncate text-center"
                      >
                        {item.period}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* DOCUMENT TYPES */}
          <div className="rounded-lg border border-[#cbd2df] bg-white p-5">
            <div className="mb-[18px] flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-[#15233b]">
                  Document Types
                </h2>

                <p className="mt-1 text-[9px] text-slate-400">
                  Distribution of processed documents.
                </p>
              </div>

              <Filter size={18} />
            </div>

            {documentTypes.length ===
            0 ? (
              <div className="grid h-[220px] place-items-center text-[10px] text-slate-400">
                No document type data available.
              </div>
            ) : (
              <div className="flex items-center gap-6 max-[500px]:flex-col">
                {/* DONUT */}
                <div className="relative h-[165px] w-[165px] shrink-0">
                  <div
                    className="h-full w-full rounded-full"
                    style={{
                      background: `conic-gradient(${documentTypes
                        .map(
                          (
                            item,
                            index,
                            arr
                          ) => {
                            const start =
                              arr
                                .slice(
                                  0,
                                  index
                                )
                                .reduce(
                                  (
                                    sum,
                                    current
                                  ) =>
                                    sum +
                                    Number(
                                      current.percentage ||
                                        0
                                    ),
                                  0
                                );

                            const end =
                              start +
                              Number(
                                item.percentage ||
                                  0
                              );

                            return `${
                              colors[
                                index %
                                  colors.length
                              ]
                            } ${start}% ${end}%`;
                          }
                        )
                        .join(", ")}`,
                    }}
                  >
                    <div className="absolute inset-[20px] flex flex-col items-center justify-center rounded-full bg-white">
                      <strong className="text-[20px] text-[#15233b]">
                        {analytics.total_processed}
                      </strong>

                      <span className="text-[9px] text-slate-400">
                        Documents
                      </span>
                    </div>
                  </div>
                </div>

                {/* LEGEND */}
                <div className="min-w-0 flex-1 space-y-3">
                  {documentTypes.map(
                    (item, index) => (
                      <div
                        key={item.type}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                colors[
                                  index %
                                    colors.length
                                ],
                            }}
                          />

                          <span className="truncate text-[10px] font-semibold text-slate-600">
                            {item.type}
                          </span>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-[9px] text-slate-400">
                            {item.count}
                          </span>

                          <span className="text-[10px] font-bold text-slate-700">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* URGENCY */}
        <section className="mb-5 rounded-lg border border-[#cbd2df] bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-semibold text-[#15233b]">
                Compliance Urgency
              </h2>

              <p className="mt-1 text-[9px] text-slate-400">
                Current compliance items grouped by urgency.
              </p>
            </div>

            <Gavel
              size={19}
              className="text-[#0861c7]"
            />
          </div>

          {urgencyCounts.length ===
          0 ? (
            <div className="rounded-md bg-green-50 px-4 py-8 text-center">
              <Check
                size={22}
                className="mx-auto text-green-500"
              />

              <p className="mt-2 text-[10px] font-semibold text-green-700">
                No compliance items found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
              {urgencyCounts.map(
                (item) => (
                  <div
                    key={item.urgency}
                    className="rounded-md border border-slate-100 bg-[#fafbff] p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={`rounded-full px-2 py-1 text-[8px] font-bold capitalize ${getUrgencyClass(
                          item.urgency
                        )}`}
                      >
                        {item.urgency}
                      </span>

                      <span className="text-[12px] font-bold text-slate-700">
                        {item.count}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[#1369c6]"
                        style={{
                          width: `${Math.max(
                            (Number(
                              item.count
                            ) /
                              maxUrgency) *
                              100,
                            5
                          )}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-[8px] text-slate-400">
                      {item.count} compliance item
                      {item.count === 1
                        ? ""
                        : "s"}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* SUMMARY */}
        <section className="rounded-lg border border-[#cbd2df] bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <BarChart3
                size={18}
                className="text-[#0861c7]"
              />
            </div>

            <div>
              <h2 className="text-[14px] font-semibold text-[#15233b]">
                Analytics Summary
              </h2>

              <p className="mt-1 text-[9px] text-slate-400">
                Current metrics are retrieved directly from
                the document processing system.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 max-[720px]:grid-cols-1">
            <div className="rounded-md bg-[#f7f9fd] p-3">
              <p className="text-[8px] uppercase tracking-wide text-slate-400">
                Document Types
              </p>

              <p className="mt-1 text-[18px] font-bold text-[#14213a]">
                {documentTypes.length}
              </p>
            </div>

            <div className="rounded-md bg-[#f7f9fd] p-3">
              <p className="text-[8px] uppercase tracking-wide text-slate-400">
                Compliance Items
              </p>

              <p className="mt-1 text-[18px] font-bold text-[#14213a]">
                {urgencyCounts.reduce(
                  (total, item) =>
                    total +
                    Number(
                      item.count || 0
                    ),
                  0
                )}
              </p>
            </div>

            <div className="rounded-md bg-[#f7f9fd] p-3">
              <p className="text-[8px] uppercase tracking-wide text-slate-400">
                Periods Tracked
              </p>

              <p className="mt-1 text-[18px] font-bold text-[#14213a]">
                {volumeByPeriod.length}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}