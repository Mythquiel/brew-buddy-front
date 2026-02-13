import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import "../style/stats.css";

interface BeverageUsage {
    beverageId: string;
    beverageName: string;
    totalCount: number;
    firstUsedAt?: string;
    lastUsedAt?: string;
}

export default function Stats() {
    const {t} = useTranslation("stats");

    const [from, setFrom] = useState<string>(defaultFrom());
    const [to, setTo] = useState<string>(defaultTo());

    const [data, setData] = useState<BeverageUsage[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(false);
            setError(null);
            fetchStats();
        }

        load();
    }, []); // Only run once on mount

    async function fetchStats() {
        try {
            setData(sampleStats());
        } catch (e: any) {
            setError(e?.message ?? String(e));
            setData(null);
        } finally {
            setLoading(false);
        }
    }

    const totalAll = (data ?? []).reduce((sum, r) => sum + (r.totalCount ?? 0), 0);

    return (
        <div className="stats-container">
            <h2>{t("title")}</h2>

            <form className="stats-filters" onSubmit={(e) => {
                e.preventDefault();
                fetchStats();
            }}>
                <div className="form-col">
                    <label htmlFor="from">{t("filters.from")}</label>
                    <input id="from" type="date" value={from} onChange={e => setFrom(e.target.value)}/>
                </div>
                <div className="form-col">
                    <label htmlFor="to">{t("filters.to")}</label>
                    <input id="to" type="date" value={to} onChange={e => setTo(e.target.value)}/>
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? t("actions.loading") : t("actions.apply")}
                </button>
                <button type="button" onClick={() => {
                    setFrom(defaultFrom());
                    setTo(defaultTo());
                }} disabled={loading}>
                    {t("actions.reset")}
                </button>
            </form>

            {error && (
                <div role="alert" className="alert-error">
                    {t("errors.failedToLoad")}: {error}
                </div>
            )}

            <div className="summary-total">
                <strong>{t("summary.totalLabel")}:</strong> {totalAll}
            </div>

            {/* Chart only (table removed) */}
            <div aria-label={t("chart.title") as string} className="chart-section">
                <h3 className="chart-title">{t("chart.title")}</h3>
                {!loading && (data ?? []).length === 0 && (
                    <div className="text-muted">{t("chart.noData")}</div>
                )}
                {loading && (
                    <div className="text-muted">{t("actions.loading")}</div>
                )}
                {!loading && (data ?? []).length > 0 && (
                    <HorizontalBarChart
                        data={(data ?? []).map(d => ({label: d.beverageName, value: d.totalCount}))}
                        valueLabel={(v) => t("chart.count", {count: v}) as string}
                        totalLabel={`${t("summary.totalLabel")}: ${totalAll}`}
                    />
                )}
            </div>

            <p className="stats-note">
                {t("note.api")}
            </p>
        </div>
    );
}

function defaultFrom() {
    const d = new Date();
    d.setDate(d.getDate() - 30); // last 30 days by default
    return toDateInput(d);
}

function defaultTo() {
    return toDateInput(new Date());
}

function toDateInput(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

interface BarDatum {
    label: string;
    value: number
}

function HorizontalBarChart({
                                data,
                                valueLabel,
                                totalLabel,
                            }: {
    data: BarDatum[];
    valueLabel?: (v: number) => string;
    totalLabel?: string;
}) {
    if (!data || data.length === 0) return null;
    const sorted = [...data].sort((a, b) => b.value - a.value);
    const max = Math.max(...sorted.map(d => d.value), 1);
    const sum = sorted.reduce((s, d) => s + d.value, 0);
    // Pleasant palette
    const colors = ["#4F46E5", "#16A34A", "#EA580C", "#0EA5E9", "#A855F7", "#DC2626", "#059669", "#F59E0B"];

    return (
            <div>
                {/* Legend/summary */}
                {totalLabel && (
                    <div className="chart-summary">
                        <span className="chart-summary-label">{totalLabel}</span>
                    </div>
                )}

                <div className="chart-grid">
                    {sorted.map((d, idx) => {
                        const pct = sum > 0 ? (d.value / sum) * 100 : 0;
                        const widthPct = (d.value / max) * 100;
                        const color = colors[idx % colors.length];
                        const gradient = `linear-gradient(90deg, ${color} 0%, ${color}CC 60%, ${color}99 100%)`;
                        const showInside = widthPct > 22; // show label inside bar when there is enough space
                        return (
                            <>
                                {/* Label with color dot */}
                                <div className="chart-label">
                                <span
                                    aria-hidden="true"
                                    className="color-dot"
                                    style={{backgroundColor: color, boxShadow: `0 0 0 2px ${color}22`}}
                                />
                                    <span title={d.label} className="truncate">{d.label}</span>
                                </div>

                                {/* Bar */}
                                <div className="bar-row">
                                    <div
                                        role="img"
                                        aria-label={`${d.label}: ${d.value} (${pct.toFixed(0)}%)`}
                                        title={`${d.label}: ${d.value} (${pct.toFixed(0)}%)`}
                                        className="bar"
                                        style={{width: `${Math.max(4, widthPct)}%`, background: gradient}}
                                    >
                                        {showInside && (
                                            <span className="bar-label-inside">
                      {valueLabel ? valueLabel(d.value) : String(d.value)} · {pct.toFixed(0)}%
                    </span>
                                        )}
                                    </div>
                                    {!showInside && (
                                        <span className="bar-label-outside">
                    {valueLabel ? valueLabel(d.value) : String(d.value)} · {pct.toFixed(0)}%
                  </span>
                                    )}
                                </div>
                            </>
                        );
                    })}
                </div>
            </div>
    );
}

function sampleStats(): BeverageUsage[] {
    return [
        {
            beverageId: "1",
            beverageName: "Espresso",
            totalCount: 42,
            firstUsedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 29).toISOString(),
            lastUsedAt: new Date().toISOString(),
        },
        {
            beverageId: "2",
            beverageName: "Green Tea",
            totalCount: 18,
            firstUsedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
            lastUsedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
            beverageId: "3",
            beverageName: "Lemonade",
            totalCount: 7,
            firstUsedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
            lastUsedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        },
    ];
}