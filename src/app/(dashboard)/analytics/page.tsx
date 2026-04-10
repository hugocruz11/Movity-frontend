"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

interface CampaignInsight {
  campaignId: string;
  campaignName: string;
  status: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  frequency: number;
  conversions: number;
  cpa: number | null;
  roas: number | null;
}

interface DashboardData {
  campaigns: CampaignInsight[];
  totals: {
    spend: number;
    impressions: number;
    reach: number;
    clicks: number;
    conversions: number;
  };
}

const STATUS_MAP: Record<string, { label: string; variant: "success" | "muted" | "error" | "warning" | "default" }> = {
  ACTIVE: { label: "Activa", variant: "success" },
  PAUSED: { label: "Pausada", variant: "muted" },
  ARCHIVED: { label: "Archivada", variant: "muted" },
};

function ctrHealth(ctr: number): "success" | "warning" | "error" {
  if (ctr >= 2) return "success";
  if (ctr >= 1) return "warning";
  return "error";
}

function freqHealth(freq: number): "success" | "warning" | "error" {
  if (freq <= 2) return "success";
  if (freq <= 3.5) return "warning";
  return "error";
}

function cpcHealth(cpc: number): "success" | "warning" | "error" {
  if (cpc <= 0.5) return "success";
  if (cpc <= 1.5) return "warning";
  return "error";
}

const HEALTH_COLORS = {
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
};

const HEALTH_BG = {
  success: "bg-success/10 border-success/20",
  warning: "bg-warning/10 border-warning/20",
  error: "bg-error/10 border-error/20",
};

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("es");
}

function formatMoney(n: number): string {
  return `$${n.toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<DashboardData>("/connections/meta/insights/dashboard")
      .then(setData)
      .catch((err) => setError(err.message || "Error al cargar analytics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Spinner size="lg" />
        <p className="text-sm text-muted">Cargando métricas de Meta Ads...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-ink">Analytics</h1>
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.campaigns.length === 0) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-ink">Analytics</h1>
        <p className="mt-1 text-sm text-muted">Métricas de tus campañas publicitarias.</p>
        <div className="mt-12 text-center">
          <p className="text-3xl">📊</p>
          <p className="mt-2 text-sm text-muted">
            Aún no hay datos. Publica una campaña para ver métricas.
          </p>
        </div>
      </div>
    );
  }

  const { campaigns, totals } = data;
  const avgCtr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const avgCpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-semibold text-ink">Analytics</h1>
      <p className="mt-1 text-sm text-muted">
        Rendimiento de tus campañas en Meta Ads.
      </p>

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <SummaryCard label="Gasto total" value={formatMoney(totals.spend)} />
        <SummaryCard label="Impresiones" value={formatNum(totals.impressions)} />
        <SummaryCard label="Alcance" value={formatNum(totals.reach)} />
        <SummaryCard
          label="CTR promedio"
          value={`${avgCtr.toFixed(2)}%`}
          health={ctrHealth(avgCtr)}
        />
        <SummaryCard
          label="CPC promedio"
          value={formatMoney(avgCpc)}
          health={cpcHealth(avgCpc)}
        />
      </div>

      {/* Campaign table */}
      <Card className="mt-6 overflow-x-auto">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Detalle por campaña
        </h3>

        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-sand text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="pb-3 pr-4">Campaña</th>
              <th className="pb-3 pr-4 text-right">Gasto</th>
              <th className="pb-3 pr-4 text-right">Impresiones</th>
              <th className="pb-3 pr-4 text-right">Clics</th>
              <th className="pb-3 pr-4 text-right">CTR</th>
              <th className="pb-3 pr-4 text-right">CPC</th>
              <th className="pb-3 pr-4 text-right">CPM</th>
              <th className="pb-3 pr-4 text-right">Freq.</th>
              <th className="pb-3 text-right">Veredicto</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const statusInfo = STATUS_MAP[c.status] || { label: c.status, variant: "default" as const };
              const verdict = getVerdict(c);
              return (
                <tr key={c.campaignId} className="border-b border-sand/50 last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-ink line-clamp-1">
                        {c.campaignName}
                      </span>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right font-medium text-ink">
                    {formatMoney(c.spend)}
                  </td>
                  <td className="py-3 pr-4 text-right text-charcoal">
                    {formatNum(c.impressions)}
                  </td>
                  <td className="py-3 pr-4 text-right text-charcoal">
                    {formatNum(c.clicks)}
                  </td>
                  <td className={`py-3 pr-4 text-right font-semibold ${HEALTH_COLORS[ctrHealth(c.ctr)]}`}>
                    {c.ctr.toFixed(2)}%
                  </td>
                  <td className={`py-3 pr-4 text-right font-semibold ${HEALTH_COLORS[cpcHealth(c.cpc)]}`}>
                    {formatMoney(c.cpc)}
                  </td>
                  <td className="py-3 pr-4 text-right text-charcoal">
                    {formatMoney(c.cpm)}
                  </td>
                  <td className={`py-3 pr-4 text-right font-semibold ${HEALTH_COLORS[freqHealth(c.frequency)]}`}>
                    {c.frequency.toFixed(1)}
                  </td>
                  <td className="py-3 text-right">
                    {c.impressions > 0 ? (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold ${HEALTH_BG[verdict.health]}`}
                      >
                        {verdict.icon} {verdict.label}
                      </span>
                    ) : (
                      <Badge variant="muted">Sin datos</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
        <span>CTR: <span className="text-success">≥2% excelente</span> · <span className="text-warning">1-2% aceptable</span> · <span className="text-error">&lt;1% mejorar</span></span>
        <span>Freq: <span className="text-success">≤2 ok</span> · <span className="text-warning">2-3.5 atención</span> · <span className="text-error">&gt;3.5 fatiga</span></span>
      </div>
    </div>
  );
}

/* ── Summary Card ── */

function SummaryCard({
  label,
  value,
  health,
}: {
  label: string;
  value: string;
  health?: "success" | "warning" | "error";
}) {
  return (
    <div className="rounded-lg border border-sand bg-cream p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p
        className={`mt-2 text-xl font-bold ${
          health ? HEALTH_COLORS[health] : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* ── Verdict logic ── */

function getVerdict(c: CampaignInsight): {
  label: string;
  icon: string;
  health: "success" | "warning" | "error";
} {
  // Simple scoring: CTR weight 40%, CPC weight 30%, Frequency weight 30%
  let score = 0;

  // CTR
  if (c.ctr >= 2) score += 40;
  else if (c.ctr >= 1) score += 20;
  else score += 0;

  // CPC
  if (c.cpc <= 0.5) score += 30;
  else if (c.cpc <= 1.5) score += 15;
  else score += 0;

  // Frequency
  if (c.frequency <= 2) score += 30;
  else if (c.frequency <= 3.5) score += 15;
  else score += 0;

  if (score >= 70) return { label: "Funciona", icon: "✓", health: "success" };
  if (score >= 35) return { label: "Revisar", icon: "~", health: "warning" };
  return { label: "Mejorar", icon: "✗", health: "error" };
}
