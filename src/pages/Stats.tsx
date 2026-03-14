import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";

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
        <div className="animate-[fadeIn_0.4s_ease-out] py-8 md:py-6">
            <h2 className="text-[1.75rem] font-bold m-0 mb-8 bg-gradient-to-br from-brew-accent to-brew-lightest [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] bg-clip-text md:text-2xl">{t("title")}</h2>

            <form className="flex gap-4 flex-wrap items-end mb-8 p-6 bg-brew-dark/20 backdrop-blur-[10px] border border-brew-accent/15 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.1)] md:p-4" onSubmit={(e) => {
                e.preventDefault();
                fetchStats();
            }}>
                <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
                    <label htmlFor="from" className="text-[0.8125rem] font-medium text-brew-accent uppercase tracking-wide">{t("filters.from")}</label>
                    <input id="from" type="date" value={from} onChange={e => setFrom(e.target.value)} className="px-4 py-3 bg-black/20 border border-brew-accent/25 rounded-lg text-brew-lightest text-[0.9375rem] transition-all duration-200 focus:outline-none focus:border-brew-accent focus:shadow-[0_0_0_3px_rgba(130,165,132,0.1)]"/>
                </div>
                <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
                    <label htmlFor="to" className="text-[0.8125rem] font-medium text-brew-accent uppercase tracking-wide">{t("filters.to")}</label>
                    <input id="to" type="date" value={to} onChange={e => setTo(e.target.value)} className="px-4 py-3 bg-black/20 border border-brew-accent/25 rounded-lg text-brew-lightest text-[0.9375rem] transition-all duration-200 focus:outline-none focus:border-brew-accent focus:shadow-[0_0_0_3px_rgba(130,165,132,0.1)]"/>
                </div>
                <button type="submit" disabled={loading} className="px-6 py-3 bg-brew-dark/60 text-brew-accent border border-brew-accent/25 rounded-lg text-[0.9375rem] font-medium cursor-pointer transition-all duration-200 whitespace-nowrap hover:not(:disabled):bg-brew-dark/80 hover:not(:disabled):border-brew-accent hover:not(:disabled):-translate-y-px hover:not(:disabled):shadow-[0_4px_12px_rgba(130,165,132,0.2)] active:not(:disabled):translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? t("actions.loading") : t("actions.apply")}
                </button>
                <button type="button" onClick={() => {
                    setFrom(defaultFrom());
                    setTo(defaultTo());
                }} disabled={loading} className="px-6 py-3 bg-brew-dark/60 text-brew-accent border border-brew-accent/25 rounded-lg text-[0.9375rem] font-medium cursor-pointer transition-all duration-200 whitespace-nowrap hover:not(:disabled):bg-brew-dark/80 hover:not(:disabled):border-brew-accent hover:not(:disabled):-translate-y-px hover:not(:disabled):shadow-[0_4px_12px_rgba(130,165,132,0.2)] active:not(:disabled):translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed">
                    {t("actions.reset")}
                </button>
            </form>

            {error && (
                <div role="alert" className="px-5 py-4 mb-6 bg-error-dark/10 border border-error-dark/30 rounded-xl text-error-light flex items-center gap-3 animate-[slideIn_0.3s_ease-out] before:content-['⚠️'] before:text-lg">
                    {t("errors.failedToLoad")}: {error}
                </div>
            )}

            <div className="mb-6 px-6 py-5 bg-gradient-to-br from-brew-dark/30 to-brew-dark/15 border border-brew-accent/20 rounded-xl text-base backdrop-blur-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
                <strong className="text-brew-accent font-semibold mr-2">{t("summary.totalLabel")}:</strong> {totalAll}
            </div>

            {/* Chart only (table removed) */}
            <div aria-label={t("chart.title") as string} className="my-8 p-8 bg-brew-dark/15 backdrop-blur-[10px] border border-brew-accent/15 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] md:p-6 md:px-4">
                <h3 className="m-0 mb-6 text-xl font-semibold text-brew-lightest">{t("chart.title")}</h3>
                {!loading && (data ?? []).length === 0 && (
                    <div className="text-brew-accent/70 italic">{t("chart.noData")}</div>
                )}
                {loading && (
                    <div className="text-brew-accent/70 italic">{t("actions.loading")}</div>
                )}
                {!loading && (data ?? []).length > 0 && (
                    <HorizontalBarChart
                        data={(data ?? []).map(d => ({label: d.beverageName, value: d.totalCount}))}
                        valueLabel={(v) => t("chart.count", {count: v}) as string}
                        totalLabel={`${t("summary.totalLabel")}: ${totalAll}`}
                    />
                )}
            </div>
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
                    <div className="flex items-baseline gap-3 mb-4 p-4 bg-brew-accent/10 rounded-lg">
                        <span className="font-semibold text-brew-accent text-base">{totalLabel}</span>
                    </div>
                )}

                <div className="grid grid-cols-[260px_1fr] gap-x-6 gap-y-4 items-center max-[640px]:grid-cols-1 max-[640px]:gap-3">
                    {sorted.map((d, idx) => {
                        const pct = sum > 0 ? (d.value / sum) * 100 : 0;
                        const widthPct = (d.value / max) * 100;
                        const color = colors[idx % colors.length];
                        const gradient = `linear-gradient(90deg, ${color} 0%, ${color}CC 60%, ${color}99 100%)`;
                        const showInside = widthPct > 22; // show label inside bar when there is enough space
                        return (
                            <>
                                {/* Label with color dot */}
                                <div className="flex items-center gap-3 min-w-0 py-2">
                                <span
                                    aria-hidden="true"
                                    className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-[0_2px_6px_rgba(0,0,0,0.2)] transition-transform duration-200 hover:scale-[1.15]"
                                    style={{backgroundColor: color, boxShadow: `0 0 0 2px ${color}22`}}
                                />
                                    <span title={d.label} className="overflow-hidden text-ellipsis whitespace-nowrap text-brew-lightest font-medium text-[0.9375rem]">{d.label}</span>
                                </div>

                                {/* Bar */}
                                <div className="flex items-center gap-3 min-w-0 py-1">
                                    <div
                                        role="img"
                                        aria-label={`${d.label}: ${d.value} (${pct.toFixed(0)}%)`}
                                        title={`${d.label}: ${d.value} (${pct.toFixed(0)}%)`}
                                        className="relative h-8 rounded-xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.15),0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-[0.4s] ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/15 before:via-white/0 before:to-black/10 before:pointer-events-none hover:scale-y-110 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.3)]"
                                        style={{width: `${Math.max(4, widthPct)}%`, background: gradient}}
                                    >
                                        {showInside && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-[0.8125rem] font-semibold [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] z-[1]">
                      {valueLabel ? valueLabel(d.value) : String(d.value)} · {pct.toFixed(0)}%
                    </span>
                                        )}
                                    </div>
                                    {!showInside && (
                                        <span className="[font-variant-numeric:tabular-nums] min-w-[80px] text-left text-brew-accent font-medium text-sm whitespace-nowrap">
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