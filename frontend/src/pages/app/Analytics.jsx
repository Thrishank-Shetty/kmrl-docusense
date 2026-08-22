import { useMemo, useState } from 'react';
import {
  Activity, BarChart3,  CalendarDays, Check, ChevronDown,
  ClipboardCheck, Clock3, Download, FileBarChart,
  FileText, Filter, Gavel, LayoutDashboard,  MoreVertical,
  Plus, Settings, TrendingDown, TrendingUp, Upload, X
} from 'lucide-react';

const departments = [
  ['Procurement', '5,240', '96.2%', '2.1%', 'Optimal'],
  ['Human Resources', '3,105', '94.5%', '4.5%', 'Optimal'],
  ['Legal', '1,890', '88.4%', '12.3%', 'Review Needed'],
  ['Finance', '3,973', '98.1%', '1.2%', 'Optimal'],
];

// const navItems = [
//   ['Dashboard', LayoutDashboard],
//   ['Documents', FileText],
//   ['Upload', Upload],
//   ['AI Search', FileBarChart],
//   ['Compliance', Gavel],
//   ['Analytics', BarChart3],
//   ['Activity', Activity],
// ];

const kpis = [
  ['Total Processed', '14,208', '+12.5%', 'file', true],
  ['Compliance Score', '94.8%', '+0.3%', 'confidence', true],
  ['Avg Processing Time', '1.2s', '-0.1s', 'time', false],
  ['Manual Review Required', '4.2%', '-1.5%', 'review', true],
];

const chartBars = [42, 62, 48, 82, 70, 94, 88];

const icons = {
  file: FileText,
  confidence: ClipboardCheck,
  time: Clock3,
  review: Gavel,
};

export default function Analytics() {
  const [activeNav, setActiveNav] = useState('Analytics');
  const [query, setQuery] = useState('');
  const [range, setRange] = useState('Last 30 Days');
  const [rangeOpen, setRangeOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [exported, setExported] = useState(false);


  const filtered = useMemo(
    () => departments.filter(([name]) =>
      name.toLowerCase().includes(query.toLowerCase())
    ),
    [query]
  );

  const exportReport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 2200);
  };

  return (
    <div className="min-h-screen flex bg-[#f7f9fd] text-[#13213a]">
      {/* MAIN */}
      <div className="ml-[220px] flex-1 min-w-0 max-[960px]:ml-[200px] max-[720px]:ml-0">
        <main className="px-7 pb-[26px] max-w-[1110px] mx-auto max-[960px]:px-5 max-[720px]:px-4">

          {/* HEADER */}
          <section className="flex justify-between items-end gap-6 py-[2px] pb-[21px] max-[720px]:block max-[720px]:pt-[19px]">
            <div>
              {/* <p className="mb-2 text-[#4a78ae] text-[9px] font-extrabold tracking-[.13em]">
                OPERATIONS INTELLIGENCE / {activeNav.toUpperCase()}
              </p> */}

              <h1 className="text-[30px] leading-[1.14] text-[#10264c] tracking-[-.9px] max-[430px]:text-[26px]">
                <b>Analytics Overview</b>
              </h1>

              <p className="mt-2 text-[#4d5868] text-[13px] max-[430px]:text-[12px]">
                Deep insights into extraction trends and operational efficiency.
              </p>
            </div>

            <div className="flex gap-[13px] mt-[17px]">
              <div className="relative">
                <button
                  onClick={() => setRangeOpen(!rangeOpen)}
                  className="h-[38px] flex items-center gap-2 px-[13px] border border-[#9aa6b8] rounded-[7px] bg-white text-[13px] font-bold"
                >
                  <CalendarDays size={18} />
                  {range}
                  <ChevronDown
                    size={16}
                    className={rangeOpen ? 'rotate-180' : ''}
                  />
                </button>

                {rangeOpen && (
                  <div className="absolute right-0 top-[44px] z-10 min-w-[158px] p-[5px] bg-white border border-[#cbd4e2] rounded-lg shadow-lg">
                    {['Last 7 Days', 'Last 30 Days', 'Last 90 Days'].map(option => (
                      <button
                        key={option}
                        onClick={() => {
                          setRange(option);
                          setRangeOpen(false);
                        }}
                        className="w-full flex justify-between px-[10px] py-[9px] text-[12px] hover:bg-[#edf4ff]"
                      >
                        {option}
                        {range === option && <Check size={15} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={exportReport}
                className="h-[38px] flex items-center gap-2 px-[13px] border border-[#142f59] rounded-[7px] bg-white text-[13px] font-bold"
              >
                <Download size={17} />
                {exported ? 'Report Ready' : 'Export Report'}
              </button>
            </div>
          </section>

          {/* KPI CARDS */}
          <section className="grid grid-cols-4 gap-5 mb-5 max-[960px]:gap-3 max-[720px]:grid-cols-2">
            {kpis.map(([label, value, change, icon, positive]) => {
              const Icon = icons[icon];
              const good = positive || change.startsWith('-');
              const Trend = good ? TrendingUp : TrendingDown;

              return (
                <article
                  key={label}
                  className="bg-white border border-[#cbd2df] rounded-lg p-[15px_14px_13px] min-h-[116px] max-[720px]:min-h-[121px] max-[430px]:px-[11px]"
                >
                  <div className="flex justify-between text-[#4e5662] text-[11px] font-semibold mb-[17px]">
                    {label}
                    <span className="text-[#0861c7]">
                      <Icon size={19} />
                    </span>
                  </div>

                  <strong className="block text-[25px] leading-none text-[#14213a] max-[430px]:text-[22px]">
                    {value}
                  </strong>

                  <div className={`flex items-center gap-1 mt-[9px] text-[10px] ${good ? 'text-[#27c69a]' : 'text-[#db3d45]'}`}>
                    <Trend size={14} />
                    <b>{change}</b>
                    <span className="text-[#4f596a]">vs last month</span>
                  </div>
                </article>
              );
            })}
          </section>

          {/* CHARTS */}
          <section className="grid grid-cols-[2.1fr_1.1fr] gap-5 mb-5 max-[960px]:grid-cols-1 max-[720px]:gap-3">

            {/* EXTRACTION CHART */}
            <div className="bg-white border border-[#cbd2df] rounded-lg p-5 relative">
              <div className="flex justify-between items-center mb-[18px]">
                <h2 className="text-[17px] font-semibold text-[#15233b]">
                  Extraction Volume Trends
                </h2>

                <button onClick={() => setMenuOpen(!menuOpen)}>
                  <MoreVertical size={19} />
                </button>
              </div>

              {menuOpen && (
                <div className="absolute right-5 top-[68px] z-10 bg-white border rounded-lg shadow-lg p-1 min-w-[158px]">
                  <button className="w-full text-left p-2 text-xs hover:bg-[#edf4ff]">
                    View details
                  </button>
                  <button className="w-full text-left p-2 text-xs hover:bg-[#edf4ff]">
                    Compare period
                  </button>
                </div>
              )}

              <div className="h-[224px] rounded-[7px] border border-[#d4dced] bg-[#f0f3fd] relative overflow-hidden max-[720px]:h-[205px]">

                <div className="absolute inset-[19px_14px_32px] flex flex-col justify-between">
                  {[1, 2, 3, 4].map(i => (
                    <span key={i} className="h-px bg-[#dbe2f0]" />
                  ))}
                </div>

                <div className="absolute inset-[22px_14px_15px] flex items-end gap-[6px]">
                  {chartBars.map((height, i) => (
                    <div
                      key={height}
                      className="flex-1 bg-[#214f82] rounded-t-[4px]"
                      style={{
                        height: `${height}%`,
                        opacity: 0.34 + i * 0.09,
                      }}
                    />
                  ))}
                </div>

                <svg
                  className="absolute inset-[20px_0_15px] w-full h-[calc(100%-35px)] z-[2]"
                  viewBox="0 0 760 250"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#1464c0" stopOpacity=".24" />
                      <stop offset="100%" stopColor="#1464c0" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M0 176 C85 125 128 137 190 145 S290 158 350 122 S438 95 500 42 S602 38 650 78 S716 98 760 138 L760 250 L0 250 Z"
                    fill="url(#chartFill)"
                  />

                  <path
                    d="M0 176 C85 125 128 137 190 145 S290 158 350 122 S438 95 500 42 S602 38 650 78 S716 98 760 138"
                    fill="none"
                    stroke="#1262c2"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute left-[17px] right-[17px] bottom-[5px] flex justify-between text-[#7d8796] text-[9px]">
                  <span>May 01</span>
                  <span>May 08</span>
                  <span>May 15</span>
                  <span>May 22</span>
                  <span>May 30</span>
                </div>
              </div>
            </div>

            {/* DOCUMENT TYPES */}
            <div className="bg-white border border-[#cbd2df] rounded-lg p-5">
              <div className="flex justify-between items-center mb-[18px]">
                <h2 className="text-[17px] font-semibold text-[#15233b]">
                  Document Types
                </h2>
                <button>
                  <Filter size={18} />
                </button>
              </div>

              <div className="h-[148px] grid place-items-center">
                <div className="w-[138px] h-[138px] rounded-full grid place-items-center relative bg-[conic-gradient(#0c2244_0_45%,#1369c6_45%_75%,#50d5a4_75%_100%)]">
                  <div className="absolute w-[95px] h-[95px] bg-white rounded-full" />

                  <div className="relative z-10 flex flex-col items-center gap-[3px]">
                    <strong className="text-[13px]">Invoices</strong>
                    <span className="text-[11px] text-[#566276]">
                      45%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-[10px] pt-[11px]">
                {[
                  ['Invoices', '45%', '#0c2244'],
                  ['Contracts', '30%', '#1369c6'],
                  ['Compliance', '25%', '#50d5a4'],
                ].map(([label, value, color]) => (
                  <div key={label} className="flex justify-between text-[12px]">
                    <span className="flex items-center gap-2">
                      <i
                        className="w-[10px] h-[10px] rounded-full"
                        style={{ background: color }}
                      />
                      {label}
                    </span>
                    <b>{value}</b>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* DEPARTMENT TABLE */}
          <section className="bg-white border border-[#cbd2df] rounded-lg p-5 pb-[14px]">
            <div className="flex justify-between items-center mb-[18px]">
              <h2 className="text-[17px] font-semibold text-[#15233b]">
                Departmental Efficiency Comparison
              </h2>

              <button className="text-[#0062c6] text-[13px] font-bold hover:underline">
                View All Departments
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] border-collapse">
                <thead>
                  <tr>
                    {['Department', 'Volume (MTD)', 'Avg Confidence', 'Exceptions', 'Status'].map(h => (
                      <th
                        key={h}
                        className="bg-[#eef2fc] text-[#4e5a70] text-[10px] font-semibold text-left px-[13px] py-2"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filtered.map(([name, volume, confidence, exceptions, status]) => (
                    <tr key={name} className="hover:bg-[#f8faff]">
                      <td className="px-[13px] py-[9px] text-[12px] font-semibold">
                        {name}
                      </td>

                      <td className="px-[13px] py-[9px] text-[12px]">
                        {volume}
                      </td>

                      <td className="px-[13px] py-[9px] text-[12px]">
                        {confidence}
                      </td>

                      <td className="px-[13px] py-[9px] text-[12px]">
                        {exceptions}
                      </td>

                      <td className="px-[13px] py-[9px]">
                        <span
                          className={`rounded-[12px] px-2 py-1 text-[9px] font-bold ${
                            status === 'Optimal'
                              ? 'text-[#087e63] bg-[#cff6e8]'
                              : 'text-[#ad2525] bg-[#ffd7d5]'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!filtered.length && (
                <div className="text-center text-[#667085] text-xs p-6">
                  No departments match “{query}”.
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}