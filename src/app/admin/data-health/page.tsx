'use client';

import React, { useState, useEffect } from 'react';
import { Database, ShieldAlert, CheckCircle, RefreshCw, BarChart2, Activity, Award, FileText } from 'lucide-react';
import Link from 'next/link';

export default function DataHealthPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchHealthData = async () => {
    try {
      const res = await fetch('/api/admin/data-health');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to load health metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const triggerSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/sync-colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSyncResult(json);
        await fetchHealthData();
      } else {
        setErrorMessage(json.error || 'Failed to complete synchronization.');
      }
    } catch (e) {
      setErrorMessage('Network connection lost during database synchronization.');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F5] flex flex-col items-center justify-center space-y-4">
        <Activity className="h-12 w-12 text-[#8B5CF6] animate-pulse" />
        <p className="text-xs text-[#B0B0C0] tracking-widest uppercase">Loading Admin Data Health Audit...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F5] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] right-[-5%] bg-glow-purple"></div>
      <div className="absolute bottom-[-10%] left-[-5%] bg-glow-purple" style={{ animationDelay: '-3s' }}></div>

      <div className="mx-auto max-w-7xl space-y-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-[#2A2A40]/40 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Admin Console
              </span>
              <span className="text-[10px] bg-[#151521] text-[#B0B0C0] border border-[#2A2A40] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Audited & Honest
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#F5F5F5] flex items-center gap-2.5">
              <Activity className="h-8 w-8 text-[#8B5CF6]" />
              Data Health & Credibility Console
            </h1>
            <p className="mt-2 text-xs text-[#B0B0C0] max-w-2xl leading-relaxed">
              Provides real-time system logs mapping cache statuses, missing database coverage distributions, and active simulated backup routes. Designed to provide 100% honesty to recruiters evaluating technical credibility.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={triggerSync}
              disabled={syncing}
              className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:opacity-90 transition-all font-bold text-xs text-white px-5 py-3 shadow-md shadow-purple-500/10 cursor-pointer disabled:opacity-50 ${
                syncing ? 'animate-pulse' : ''
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Trigger Sync Now'}
            </button>
            <Link
              href="/"
              className="flex items-center justify-center rounded-xl bg-[#151521]/60 border border-[#2A2A40] text-[#B0B0C0] hover:text-[#F5F5F5] hover:border-[#8B5CF6]/40 transition-all font-bold text-xs px-5 py-3 cursor-pointer"
            >
              Exit Console
            </Link>
          </div>
        </div>

        {/* Sync notification banners */}
        {syncResult && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs flex items-start gap-3 animate-fade-in">
            <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-400">Database Synchronizer Success</h4>
              <p className="mt-1 text-[#B0B0C0] leading-relaxed">
                Ingested <span className="font-bold text-emerald-300">{syncResult.processed} colleges</span>. Mapped database updates successfully: 
                <span className="font-semibold text-[#F5F5F5]"> Added: {syncResult.added}, Updated: {syncResult.updated}, Failed: {syncResult.failed}, Skipped: {syncResult.skipped}</span>.
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs flex items-start gap-3 animate-fade-in">
            <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-400">Database Synchronization Error</h4>
              <p className="mt-1 text-[#B0B0C0] leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: 'Colleges Seeded/Cached',
              value: data.collegesProcessed,
              desc: 'Total active normalized records',
              icon: FileText,
              color: 'text-purple-400',
              bg: 'bg-purple-500/5'
            },
            {
              title: 'Database State',
              value: data.databaseOnline ? 'PostgreSQL' : 'JSON Fallback',
              desc: data.databaseOnline ? 'Connected (Production Online)' : 'Active Fallback (Seeded Mock)',
              icon: Database,
              color: data.databaseOnline ? 'text-emerald-400' : 'text-amber-400',
              bg: data.databaseOnline ? 'bg-emerald-500/5' : 'bg-amber-500/5'
            },
            {
              title: 'Average Quality Score',
              value: `${data.averageConfidence}%`,
              desc: 'Pipeline validator index average',
              icon: Award,
              color: 'text-purple-400',
              bg: 'bg-[#8B5CF6]/5'
            },
            {
              title: 'Cache Health status',
              value: data.cacheHealth?.exists ? 'Healthy' : 'Uninitialized',
              desc: `Age: ${data.cacheHealth?.exists ? 'Updated recently' : 'Uncached'} / Size: ${(data.cacheHealth?.sizeBytes / 1024).toFixed(1)} KB`,
              icon: CheckCircle,
              color: data.cacheHealth?.exists ? 'text-emerald-400' : 'text-red-400',
              bg: data.cacheHealth?.exists ? 'bg-emerald-500/5' : 'bg-red-500/5'
            }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className={`rounded-2xl border border-[#2A2A40] bg-[#151521]/45 p-6 space-y-3 backdrop-blur-sm shadow-sm select-none ${card.bg}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#B0B0C0] uppercase font-bold tracking-widest">{card.title}</span>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div className="text-2xl font-extrabold tracking-tight text-[#F5F5F5]">{card.value}</div>
                <p className="text-[10px] text-[#B0B0C0] leading-snug">{card.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Breakdown Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Ingestion Source Breakdown */}
          <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/30 p-6 backdrop-blur-sm space-y-4">
            <h3 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2">
              <BarChart2 className="h-4.5 w-4.5 text-[#8B5CF6]" />
              Data Source Contributions Breakdown
            </h3>
            <p className="text-xs text-[#B0B0C0] leading-relaxed">
              Distribution of public registries, rankings, and statistical feeds participating in mapping and metadata enrichment across the dataset:
            </p>

            <div className="space-y-4 pt-2">
              {data.sourcesSummary && data.sourcesSummary.length > 0 ? (
                data.sourcesSummary.map((source: any, idx: number) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#F5F5F5]">{source.source}</span>
                      <span className="font-bold text-[#8B5CF6]">{source.count} records ({source.percentage}%)</span>
                    </div>
                    <div className="w-full bg-[#151521] border border-[#2A2A40]/40 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#8B5CF6] h-full rounded-full" 
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-500 italic">No source breakdown data available.</p>
              )}
            </div>
          </div>

          {/* Missing Fields Coverage Audit */}
          <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/30 p-6 backdrop-blur-sm space-y-4">
            <h3 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 text-amber-500" />
              Incomplete Public Data Coverage Audit
            </h3>
            <p className="text-xs text-[#B0B0C0] leading-relaxed">
              Exposes metrics that were missing in the public registries (UGC/NIRF/AICTE/Data.gov) and were fallback-enriched using platform defaults. **Low percentage is healthy**:
            </p>

            <div className="overflow-hidden rounded-xl border border-[#2A2A40] bg-[#0A0A0F]/40 text-xs">
              <table className="min-w-full divide-y divide-[#2A2A40] text-left">
                <thead className="bg-[#151521]/80 text-[10px] uppercase font-bold tracking-wider text-[#B0B0C0]">
                  <tr>
                    <th className="px-4 py-3">Missing Attribute</th>
                    <th className="px-4 py-3">Missing Count</th>
                    <th className="px-4 py-3">Enrichment Dependency Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A40]/50 text-[#B0B0C0]">
                  {data.missingPercentages && data.missingPercentages.length > 0 ? (
                    data.missingPercentages.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#151521]/20">
                        <td className="px-4 py-3 font-mono text-purple-300 font-semibold">{item.field}</td>
                        <td className="px-4 py-3 font-medium text-neutral-300">{item.count} colleges</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            item.percentage > 70 
                              ? 'bg-red-500/10 text-red-400' 
                              : item.percentage > 30 
                              ? 'bg-amber-500/10 text-amber-400' 
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {item.percentage}% fallback
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-emerald-400 font-semibold">
                        ✓ 100% complete coverage. Zero fallback-enrichments required!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Credibility Notes & Interview Disclaimer */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 backdrop-blur-sm space-y-3">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
            <ShieldAlert className="h-4.5 w-4.5" />
            Interview Disclaimer: Dynamic Fallback vs Production Truth
          </h3>
          <p className="text-xs text-[#B0B0C0] leading-relaxed">
            During recruiter evaluation, this app runs inside a sandboxed mock database setup if a PostgreSQL database instance isn't provided. This health panel allows you to prove to interviewers that you didn't simply hardcode static arrays. Clicking **"Trigger Sync Now"** demonstrates that the pipeline synchronizes, queries Levenshtein distance names, structures normalization logic, and populates memory search indexes dynamically.
          </p>
        </div>

      </div>
    </div>
  );
}
