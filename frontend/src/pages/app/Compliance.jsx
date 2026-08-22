import { useEffect, useState } from "react";
import { AlertTriangle, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { getComplianceStats, getUpcomingCompliance } from "../../lib/api";

const urgencyStyles = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  low: "bg-green-50 text-green-700 border-green-200",
};

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-3">
      <p className="text-[8px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-[22px] font-bold text-[#111827]">{value}</p>
    </div>
  );
}

export default function Compliance() {
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, upcomingRes] = await Promise.all([
          getComplianceStats(),
          getUpcomingCompliance(),
        ]);
        if (!cancelled) {
          setStats(statsRes.data);
          setUpcoming(upcomingRes.data);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Failed to load compliance data. Is the backend running?");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#F3F4F6] p-5">
        <Loader2 className="animate-spin text-[#0056B3]" size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-[#F3F4F6] p-5">
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[11px] text-red-700">
          <AlertCircle size={16} /> {error}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-full bg-[#F3F4F6] p-5">
      <div className="mb-4">
        <h1 className="text-[20px] font-bold text-[#111827]">Compliance</h1>
        <p className="mt-1 text-[11px] text-[#1E293B]/65">
          Deadlines and risk levels extracted from your documents.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-4 gap-3 md:grid-cols-7">
        <StatCard label="Total Documents" value={stats.total_documents} />
        <StatCard label="Total Compliance Items" value={stats.total_compliance_items} />
        <StatCard label="Critical" value={stats.critical} />
        <StatCard label="High" value={stats.high} />
        <StatCard label="Low" value={stats.low} />
        <StatCard label="Due in 7 Days" value={stats.upcoming_7_days} />
        <StatCard label="Due in 30 Days" value={stats.upcoming_30_days} />
        <StatCard label="Overdue" value={stats.overdue} />
      </div>

      {/* Upcoming risks */}
      <section className="rounded-lg border border-[#E5E7EB] bg-white overflow-hidden">
        <div className="flex h-11 items-center border-b border-[#E5E7EB] px-4">
          <h2 className="text-[11px] font-semibold text-[#111827]">Upcoming Compliance Risks</h2>
        </div>

        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <CheckCircle className="text-green-500" size={20} />
            </div>

            <p className="text-[11px] font-semibold text-slate-700">
              No upcoming compliance risks
            </p>

            <p className="max-w-[280px] text-[9px] text-slate-400">
              Your processed documents currently have no upcoming
              compliance deadlines.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {upcoming.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-[10px] font-medium text-[#111827]">
                    Document #{item.document_id}
                  </p>
                  <p className="mt-0.5 text-[9px] text-slate-500">
                    {item.risk_type} · Deadline: {item.deadline_date}
                  </p>
                </div>
                <span
                  className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-medium ${
                    urgencyStyles[item.urgency] || "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  {item.urgency === "critical" && <AlertTriangle size={10} />}
                  {item.urgency}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}