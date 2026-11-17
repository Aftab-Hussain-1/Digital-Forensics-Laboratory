import { AlertTriangle, CheckCircle2, Eye, Server } from 'lucide-react';
import { useState } from 'react';
import { FORENSIC_ANALYSIS_DATASETS } from '../data/forensicsAnalysisData';

export function ForensicAnalysisView() {
  const [selectedId, setSelectedId] = useState<string>(FORENSIC_ANALYSIS_DATASETS[0].id);
  const [severityFilter, setSeverityFilter] = useState<'All' | 'Suspicious' | 'Noteworthy' | 'Safe'>('All');

  const dataset =
    FORENSIC_ANALYSIS_DATASETS.find((d) => d.id === selectedId) ?? FORENSIC_ANALYSIS_DATASETS[0];

  const totalItems = dataset.suspiciousCount + dataset.noteworthyCount + dataset.safeCount;
  const suspPct = Math.max((dataset.suspiciousCount / totalItems) * 100, 2);
  const notePct = (dataset.noteworthyCount / totalItems) * 100;
  const safePct = Math.max(100 - suspPct - notePct, 0);

  const filteredArtifacts =
    severityFilter === 'All'
      ? dataset.artifacts
      : dataset.artifacts.filter((a) => a.severity === severityFilter);

  return (
    <div className="space-y-6">
      {/* Dataset Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <p className="text-xs font-mono text-slate-400">
            Forensic Analysis Module · {dataset.caseNumber}
          </p>
          <h1 className="text-xl font-semibold text-slate-100 mt-0.5">
            Network, Memory, Disk & Mobile Analysis
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#131a26] border border-slate-800 rounded-lg">
          {FORENSIC_ANALYSIS_DATASETS.map((ds) => (
            <button
              key={ds.id}
              type="button"
              onClick={() => {
                setSelectedId(ds.id);
                setSeverityFilter('All');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                ds.id === dataset.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {ds.analysisType.replace(' Dashboard', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Summary Card modeled after Reference Screen 4 ("Traffic Analysis Dashboard") */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-[#131a26] border border-slate-800 rounded-lg p-6">
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          <div>
            <p className="text-xs font-medium text-emerald-400">{dataset.statusText}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-100">{dataset.title}</h2>
            <p className="mt-2 text-xs text-slate-400 max-w-2xl leading-relaxed">{dataset.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-mono">
            <span>{dataset.dataSource}</span>
            <span className="text-slate-600">·</span>
            <span>{dataset.captureDurationOrSize}</span>
            <span className="text-slate-600">·</span>
            <span>Examiner: {dataset.examiner}</span>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#182130] border border-slate-700/80 rounded-lg p-4 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Suspicious Activity</span>
            </span>
            <button
              type="button"
              onClick={() => setSeverityFilter('Suspicious')}
              className="px-2.5 py-1 text-[11px] font-medium text-white bg-rose-600 rounded hover:bg-rose-500"
            >
              View Flagged
            </button>
          </div>

          <div>
            <p className="text-3xl font-semibold text-slate-100 tabular-nums">{dataset.suspiciousCount}</p>
            <p className="text-xs text-slate-400 mt-0.5">Artifacts requiring investigation</p>
          </div>

          <div className="space-y-1.5">
            <div className="h-1.5 w-full rounded-full overflow-hidden flex bg-slate-800">
              <div className="bg-rose-500 h-full" style={{ width: `${suspPct}%` }} />
              <div className="bg-amber-400 h-full" style={{ width: `${notePct}%` }} />
              <div className="bg-emerald-500 h-full" style={{ width: `${safePct}%` }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
              <span className="text-rose-400">Suspicious</span>
              <span className="text-amber-400">Noteworthy</span>
              <span className="text-emerald-400">Safe</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Severity KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setSeverityFilter(severityFilter === 'Suspicious' ? 'All' : 'Suspicious')}
          className={`text-left bg-[#131a26] border rounded-lg p-4 transition-colors ${
            severityFilter === 'Suspicious' ? 'border-rose-500' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-400 mb-3" aria-hidden="true" />
          <p className="text-2xl font-semibold text-slate-100 tabular-nums">{dataset.suspiciousCount}</p>
          <p className="text-xs font-medium text-slate-200 mt-1">Suspicious</p>
          <p className="text-[11px] text-slate-400">High-priority indicators</p>
        </button>

        <button
          type="button"
          onClick={() => setSeverityFilter(severityFilter === 'Noteworthy' ? 'All' : 'Noteworthy')}
          className={`text-left bg-[#131a26] border rounded-lg p-4 transition-colors ${
            severityFilter === 'Noteworthy' ? 'border-amber-500' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <Eye className="w-4 h-4 text-amber-400 mb-3" aria-hidden="true" />
          <p className="text-2xl font-semibold text-slate-100 tabular-nums">{dataset.noteworthyCount}</p>
          <p className="text-xs font-medium text-slate-200 mt-1">Noteworthy</p>
          <p className="text-[11px] text-slate-400">Behavioral observations</p>
        </button>

        <button
          type="button"
          onClick={() => setSeverityFilter(severityFilter === 'Safe' ? 'All' : 'Safe')}
          className={`text-left bg-[#131a26] border rounded-lg p-4 transition-colors ${
            severityFilter === 'Safe' ? 'border-emerald-500' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-3" aria-hidden="true" />
          <p className="text-2xl font-semibold text-slate-100 tabular-nums">{dataset.safeCount}</p>
          <p className="text-xs font-medium text-slate-200 mt-1">Safe</p>
          <p className="text-[11px] text-slate-400">Verified benign baselines</p>
        </button>

        <div className="bg-[#131a26] border border-slate-800 rounded-lg p-4">
          <Server className="w-4 h-4 text-sky-400 mb-3" aria-hidden="true" />
          <p className="text-2xl font-semibold text-slate-100 tabular-nums">{dataset.endpointsCount}</p>
          <p className="text-xs font-medium text-slate-200 mt-1">Endpoints / Modules</p>
          <p className="text-[11px] text-slate-400">Evaluated artifacts</p>
        </div>
      </div>

      {/* General Information & Activity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[#131a26] border border-slate-800 rounded-lg p-5 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">General Information</h3>
            <p className="text-xs text-slate-400">Capture source & validated tool environment</p>
          </div>
          <dl className="divide-y divide-slate-800/80 text-xs">
            <div className="py-2.5 flex justify-between gap-4">
              <dt className="text-slate-400">Data Source</dt>
              <dd className="font-mono text-slate-200 text-right">{dataset.dataSource}</dd>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <dt className="text-slate-400">Validated Tooling</dt>
              <dd className="text-slate-200 text-right">{dataset.toolSuite}</dd>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <dt className="text-slate-400">Case Reference</dt>
              <dd className="font-mono text-sky-400 text-right">{dataset.caseNumber}</dd>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <dt className="text-slate-400">Lead Examiner</dt>
              <dd className="text-slate-200 text-right">{dataset.examiner}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-[#131a26] border border-slate-800 rounded-lg p-5 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Activity Breakdown</h3>
            <p className="text-xs text-slate-400">Observed telemetry categories by investigation priority</p>
          </div>
          <div className="divide-y divide-slate-800/80 text-xs">
            {dataset.breakdown.map((item) => (
              <div key={item.label} className="py-2.5 flex items-center justify-between gap-4">
                <span className="text-slate-200">{item.label}</span>
                <div className="flex items-center gap-3 font-mono tabular-nums">
                  <span
                    className={
                      item.severity === 'Suspicious'
                        ? 'text-rose-400'
                        : item.severity === 'Noteworthy'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }
                  >
                    {item.severity}
                  </span>
                  <span className="text-slate-100 font-semibold w-10 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Artifact Findings Table */}
      <div className="bg-[#131a26] border border-slate-800 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-slate-100">
            Observed Forensic Artifacts ({severityFilter})
          </h3>
          {severityFilter !== 'All' && (
            <button
              type="button"
              onClick={() => setSeverityFilter('All')}
              className="text-xs text-sky-400 hover:text-sky-300"
            >
              Show all severities
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0f1520] text-slate-400 font-medium">
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Source</th>
                <th className="py-2.5 px-4">Target / Destination</th>
                <th className="py-2.5 px-4">Module / Protocol</th>
                <th className="py-2.5 px-4">Classification</th>
                <th className="py-2.5 px-4">Observation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredArtifacts.map((art) => (
                <tr key={art.id} className="hover:bg-[#171f2d]">
                  <td className="py-3 px-4 font-mono text-slate-400 tabular-nums whitespace-nowrap">
                    {art.timestamp}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-200 whitespace-nowrap">{art.source}</td>
                  <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                    {art.destinationOrTarget}
                  </td>
                  <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{art.protocolOrModule}</td>
                  <td className="py-3 px-4 whitespace-nowrap font-medium">
                    <span
                      className={
                        art.severity === 'Suspicious'
                          ? 'text-rose-400'
                          : art.severity === 'Noteworthy'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }
                    >
                      {art.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{art.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
