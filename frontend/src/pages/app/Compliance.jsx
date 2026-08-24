import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Search,
  X,
  ChevronDown,
  Clock3,
  ShieldAlert,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
} from "lucide-react";
import {
  getComplianceStats,
  getUpcomingCompliance,
  getAllDocuments,
  getComplianceCalendar,
} from "../../lib/api";
import { useToast } from "../../components/common/useToast";

const urgencyStyles = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  low: "bg-green-50 text-green-700 border-green-200",
};

const urgencyOrder = { critical: 1, high: 2, medium: 3, low: 4 };

function StatCard({ label, value, danger = false }) {
  return (
    <div
      className={`rounded-lg border bg-white px-4 py-3 ${
        danger ? "border-red-200" : "border-[#E5E7EB]"
      }`}
    >
      <p className="text-[8px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 text-[22px] font-bold ${
          danger ? "text-red-600" : "text-[#111827]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ComplianceCalendarGrid({ date, setDate, data, loading, documentMap }) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed

  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthLabel = date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const goToPrevMonth = () => setDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setDate(new Date(year, month + 1, 1));
  const goToToday = () => setDate(new Date());

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayKey = new Date().toISOString().split("T")[0];

  const urgencyDot = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-green-500",
  };

  return (
    <section className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
        <h2 className="text-[11px] font-semibold text-[#111827]">
          {monthLabel}
        </h2>

        <div className="flex items-center gap-1.5">
          <button
            onClick={goToToday}
            className="rounded-md border border-slate-200 px-2 py-1 text-[8px] font-semibold text-slate-500 hover:bg-slate-50"
          >
            Today
          </button>
          <button
            onClick={goToPrevMonth}
            className="rounded-md border border-slate-200 p-1 text-slate-500 hover:bg-slate-50"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            onClick={goToNextMonth}
            className="rounded-md border border-slate-200 p-1 text-slate-500 hover:bg-slate-50"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-[9px] text-slate-400">
          Loading calendar...
        </div>
      ) : (
        <div className="p-3">
          <div className="grid grid-cols-7 gap-1 pb-1 text-center text-[8px] font-semibold text-slate-400">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-[68px]" />;
              }

              const dateKey = new Date(year, month, day)
                .toISOString()
                .split("T")[0];
              const dayItems = data[dateKey] || [];
              const isToday = dateKey === todayKey;

              return (
                <div
                  key={dateKey}
                  className={`h-[68px] overflow-hidden rounded-md border px-1.5 py-1 ${
                    isToday
                      ? "border-[#0056B3] bg-blue-50/40"
                      : "border-slate-100"
                  }`}
                >
                  <p
                    className={`text-[8px] font-semibold ${
                      isToday ? "text-[#0056B3]" : "text-slate-500"
                    }`}
                  >
                    {day}
                  </p>

                  <div className="mt-1 space-y-0.5">
                    {dayItems.slice(0, 2).map((item) => (
                      <div
                        key={item.compliance_item_id}
                        title={
                          documentMap[item.document_id] ||
                          item.filename ||
                          "Document"
                        }
                        className="flex items-center gap-1 truncate rounded bg-slate-50 px-1 py-0.5 text-[7px] text-slate-600"
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            urgencyDot[item.urgency] || "bg-slate-400"
                          }`}
                        />
                        <span className="truncate">
                          {item.filename || `Doc #${item.document_id}`}
                        </span>
                      </div>
                    ))}

                    {dayItems.length > 2 && (
                      <p className="text-[7px] text-slate-400">
                        +{dayItems.length - 2} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default function Compliance() {
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("deadline");

  // Calendar view state
  const [view, setView] = useState("list"); // "list" | "calendar"
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [calendarLoading, setCalendarLoading] = useState(false);

  const loadCompliance = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      const [statsRes, upcomingRes, documentsRes] =
        await Promise.all([
          getComplianceStats(),
          getUpcomingCompliance(),
          getAllDocuments(),
        ]);

      setStats(statsRes.data);
      setUpcoming(upcomingRes.data || []);
      setDocuments(documentsRes.data || []);

      if (isRefresh) showToast("Compliance data refreshed");
    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.detail ||
        "Failed to load compliance data. Is the backend running?";

      setError(message);
      if (isRefresh) showToast(message, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [statsRes, upcomingRes, documentsRes] =
          await Promise.all([
            getComplianceStats(),
            getUpcomingCompliance(),
            getAllDocuments(),
          ]);

        if (!cancelled) {
          setStats(statsRes.data);
          setUpcoming(upcomingRes.data || []);
          setDocuments(documentsRes.data || []);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
              "Failed to load compliance data. Is the backend running?"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch calendar data whenever the calendar view is active or the month changes
  useEffect(() => {
    if (view !== "calendar") return;

    let cancelled = false;
    setCalendarLoading(true);

    getComplianceCalendar(
      calendarDate.getFullYear(),
      calendarDate.getMonth() + 1
    )
      .then((res) => {
        if (!cancelled) setCalendarData(res.data.days || {});
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) showToast("Failed to load calendar", "error");
      })
      .finally(() => {
        if (!cancelled) setCalendarLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, calendarDate]);

  const documentMap = useMemo(
    () =>
      documents.reduce((map, document) => {
        map[document.id] =
          document.filename || `Document #${document.id}`;
        return map;
      }, {}),
    [documents]
  );

  const filteredUpcoming = useMemo(() => {
    let result = [...upcoming];

    if (search.trim()) {
      const query = search.toLowerCase().trim();

      result = result.filter((item) => {
        const filename =
          documentMap[item.document_id]?.toLowerCase() || "";
        const riskType = item.risk_type?.toLowerCase() || "";
        const urgency = item.urgency?.toLowerCase() || "";

        return (
          filename.includes(query) ||
          riskType.includes(query) ||
          urgency.includes(query)
        );
      });
    }

    if (urgencyFilter !== "all") {
      result = result.filter(
        (item) => item.urgency === urgencyFilter
      );
    }

    result.sort((a, b) => {
      if (sortBy === "urgency") {
        return (
          (urgencyOrder[a.urgency] || 99) -
          (urgencyOrder[b.urgency] || 99)
        );
      }

      if (sortBy === "latest") {
        return (
          new Date(b.deadline_date || 0) -
          new Date(a.deadline_date || 0)
        );
      }

      return (
        new Date(a.deadline_date || 0) -
        new Date(b.deadline_date || 0)
      );
    });

    return result;
  }, [
    upcoming,
    documentMap,
    search,
    urgencyFilter,
    sortBy,
  ]);

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;

    const today = new Date();
    const target = new Date(deadline);

    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    return Math.ceil(
      (target - today) / (1000 * 60 * 60 * 24)
    );
  };

  const clearFilters = () => {
    setSearch("");
    setUrgencyFilter("all");
    setSortBy("deadline");
  };

  const hasFilters =
    search.trim() ||
    urgencyFilter !== "all" ||
    sortBy !== "deadline";

  if (loading) {
    return (
      <div className="min-h-full bg-[#F3F4F6] p-5">
        <div className="mb-5">
          <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-72 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="mb-5 grid grid-cols-4 gap-3 lg:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-[82px] animate-pulse rounded-lg border border-slate-200 bg-white"
            />
          ))}
        </div>

        <div className="h-[350px] animate-pulse rounded-lg border border-slate-200 bg-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-[#F3F4F6] p-5">
        <h1 className="text-[20px] font-bold text-[#111827]">
          Compliance
        </h1>

        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={17}
              className="mt-0.5 shrink-0 text-red-500"
            />

            <div>
              <p className="text-[11px] font-semibold text-red-800">
                Unable to load compliance data
              </p>

              <p className="mt-1 text-[9px] text-red-700">
                {error}
              </p>

              <button
                onClick={() => loadCompliance()}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-[9px] font-semibold text-white hover:bg-red-700"
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
    <main className="min-h-full bg-[#F3F4F6] p-5">
      {/* HEADER */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-[#111827]">
            Compliance
          </h1>

          <p className="mt-1 text-[11px] text-[#1E293B]/65">
            Deadlines and risk levels extracted from your documents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* LIST / CALENDAR TOGGLE */}
          <div className="flex items-center rounded-md border border-slate-200 bg-white p-0.5">
            <button
              onClick={() => setView("list")}
              className={`flex h-7 items-center gap-1 rounded px-2.5 text-[9px] font-semibold transition ${
                view === "list"
                  ? "bg-[#0056B3] text-white"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <List size={12} />
              List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`flex h-7 items-center gap-1 rounded px-2.5 text-[9px] font-semibold transition ${
                view === "calendar"
                  ? "bg-[#0056B3] text-white"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <LayoutGrid size={12} />
              Calendar
            </button>
          </div>

          <button
            onClick={() => loadCompliance(true)}
            disabled={refreshing}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-[9px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={13}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
        <StatCard
          label="Total Documents"
          value={stats?.total_documents ?? 0}
        />
        <StatCard
          label="Compliance Items"
          value={stats?.total_compliance_items ?? 0}
        />
        <StatCard
          label="Critical"
          value={stats?.critical ?? 0}
          danger={stats?.critical > 0}
        />
        <StatCard
          label="High"
          value={stats?.high ?? 0}
          danger={stats?.high > 0}
        />
        <StatCard
          label="Low"
          value={stats?.low ?? 0}
        />
        <StatCard
          label="Due in 7 Days"
          value={stats?.upcoming_7_days ?? 0}
          danger={stats?.upcoming_7_days > 0}
        />
        <StatCard
          label="Due in 30 Days"
          value={stats?.upcoming_30_days ?? 0}
        />
        <StatCard
          label="Overdue"
          value={stats?.overdue ?? 0}
          danger={stats?.overdue > 0}
        />
      </div>

      {/* FILTER BAR — only shown in list view */}
      {view === "list" && (
        <section className="mb-3 rounded-lg border border-[#E5E7EB] bg-white p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search document or risk..."
                className="h-8 w-full rounded-md border border-slate-200 bg-[#FAFBFC] pl-9 pr-8 text-[9px] outline-none focus:border-[#0056B3]"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="h-8 min-w-[125px] appearance-none rounded-md border border-slate-200 bg-white px-3 pr-7 text-[9px] capitalize text-slate-600 outline-none focus:border-[#0056B3]"
              >
                <option value="all">All Urgency</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <ChevronDown
                size={12}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-8 min-w-[145px] appearance-none rounded-md border border-slate-200 bg-white px-3 pr-7 text-[9px] text-slate-600 outline-none focus:border-[#0056B3]"
              >
                <option value="deadline">Nearest Deadline</option>
                <option value="urgency">Highest Risk</option>
                <option value="latest">Latest Deadline</option>
              </select>

              <ChevronDown
                size={12}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex h-8 items-center gap-1 text-[9px] font-medium text-slate-500 hover:text-slate-700"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>

          <p className="mt-2 text-[8px] text-slate-400">
            Showing {filteredUpcoming.length} upcoming compliance{" "}
            {filteredUpcoming.length === 1 ? "item" : "items"}
          </p>
        </section>
      )}

      {/* LIST VIEW or CALENDAR VIEW */}
      {view === "list" ? (
        <section className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
          <div className="flex min-h-11 items-center justify-between border-b border-[#E5E7EB] px-4">
            <div>
              <h2 className="text-[11px] font-semibold text-[#111827]">
                Upcoming Compliance Risks
              </h2>

              <p className="mt-0.5 text-[8px] text-slate-400">
                Deadlines detected from processed documents.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-semibold text-slate-500">
              {filteredUpcoming.length}
            </span>
          </div>

          {filteredUpcoming.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                <CheckCircle
                  className="text-green-500"
                  size={20}
                />
              </div>

              <p className="text-[11px] font-semibold text-slate-700">
                {upcoming.length === 0
                  ? "No upcoming compliance risks"
                  : "No matching compliance risks"}
              </p>

              <p className="max-w-[300px] text-[9px] leading-relaxed text-slate-400">
                {upcoming.length === 0
                  ? "Your processed documents currently have no upcoming compliance deadlines."
                  : "Try changing your search or urgency filter."}
              </p>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {filteredUpcoming.map((item) => {
                const daysRemaining = getDaysRemaining(
                  item.deadline_date
                );
                const isOverdue =
                  daysRemaining !== null && daysRemaining < 0;
                const filename =
                  documentMap[item.document_id] ||
                  `Document #${item.document_id}`;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-[#FAFBFF] ${
                      isOverdue ? "bg-red-50/30" : ""
                    }`}
                  >
                    {/* DOCUMENT */}
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                          isOverdue
                            ? "bg-red-50"
                            : item.urgency === "critical"
                            ? "bg-red-50"
                            : item.urgency === "high"
                            ? "bg-orange-50"
                            : "bg-blue-50"
                        }`}
                      >
                        {isOverdue ? (
                          <ShieldAlert
                            size={15}
                            className="text-red-500"
                          />
                        ) : (
                          <CalendarDays
                            size={15}
                            className="text-[#0056B3]"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-semibold text-[#111827]">
                          {filename}
                        </p>

                        <p className="mt-0.5 text-[9px] text-slate-500">
                          {item.risk_type || "Compliance Risk"}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[8px] text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={10} />
                            {formatDate(item.deadline_date)}
                          </span>

                          {daysRemaining !== null && (
                            <span
                              className={
                                isOverdue
                                  ? "font-semibold text-red-600"
                                  : daysRemaining <= 7
                                  ? "font-semibold text-orange-600"
                                  : "text-slate-400"
                              }
                            >
                              {isOverdue
                                ? `${Math.abs(daysRemaining)} day${
                                    Math.abs(daysRemaining) === 1
                                      ? ""
                                      : "s"
                                  } overdue`
                                : daysRemaining === 0
                                ? "Due today"
                                : `${daysRemaining} day${
                                    daysRemaining === 1
                                      ? ""
                                      : "s"
                                  } remaining`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* URGENCY */}
                    <span
                      className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-medium ${
                        urgencyStyles[item.urgency] ||
                        "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      {item.urgency === "critical" && (
                        <AlertTriangle size={10} />
                      )}
                      {item.urgency || "unknown"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <ComplianceCalendarGrid
          date={calendarDate}
          setDate={setCalendarDate}
          data={calendarData}
          loading={calendarLoading}
          documentMap={documentMap}
        />
      )}

      {/* OVERDUE NOTICE */}
      {stats?.overdue > 0 && (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5">
          <AlertTriangle
            size={14}
            className="shrink-0 text-red-500"
          />

          <p className="text-[9px] text-red-700">
            <span className="font-semibold">
              {stats.overdue} compliance{" "}
              {stats.overdue === 1 ? "item is" : "items are"} overdue.
            </span>{" "}
            Overdue items are currently included in the backend statistics.
          </p>
        </div>
      )}

      {/* DATA NOTE */}
      <div className="mt-3 flex items-center gap-1.5 text-[8px] text-slate-400">
        <Clock3 size={11} />
        Compliance data is calculated from the latest processed documents.
      </div>
    </main>
  );
}