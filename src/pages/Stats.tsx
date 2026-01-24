import { useEffect, useMemo, useState } from "react";
import styles from "../style/stats.module.css";
import { useTranslation } from "react-i18next";

interface Beverage {
    id: string;
    type: string;
    name: string;
    tags?: string[];
    imageUrl?: string;
}

function useApiBaseUrl() {
    return useMemo(() => {
        const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;

        if (fromEnv && fromEnv.trim().length > 0) {
            return fromEnv.replace(/\/$/, "");
        }
        return "";
    }, []);
}

export default function Stats() {
    const { t } = useTranslation("stats");
    const baseUrl = useApiBaseUrl();
    const [drinks, setDrinks] = useState<Beverage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const SAMPLE_BEVERAGES: Beverage[] = [
        {
            id: crypto.randomUUID(),
            type: "Coffee",
            name: "Espresso",
            tags: ["Strong", "Hot", "Espresso"],
            imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
        },
        {
            id: crypto.randomUUID(),
            type: "Tea",
            name: "Green Tea",
            tags: ["Green", "Hot"],
            imageUrl: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92",
        },
        {
            id: crypto.randomUUID(),
            type: "Tea",
            name: "Black Tea",
            imageUrl: "https://images.unsplash.com/photo-1584270354949-1d3e7f9f0d3d",
        },
        {
            id: crypto.randomUUID(),
            name: "Lemonade",
            type: "Juice",
            imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6cf7",
        },
    ];

    useEffect(() => {
        async function load() {
            setLoading(false);
            setError(null);
            setDrinks(SAMPLE_BEVERAGES);
        }

        load();
    }, [baseUrl]);

    const typeDistribution = useMemo(() => {
        const counts = new Map<string, number>();
        drinks.forEach((d) => {
            const type = d.type || "Unknown";
            counts.set(type, (counts.get(type) || 0) + 1);
        });
        const entries = Array.from(counts.entries()).map(([type, count]) => ({
            type,
            count,
            percentage: (count / drinks.length) * 100,
        }));
        return entries.sort((a, b) => b.count - a.count);
    }, [drinks]);

    const tagFrequency = useMemo(() => {
        const counts = new Map<string, number>();
        drinks.forEach((d) => {
            d.tags?.forEach((tag) => {
                counts.set(tag, (counts.get(tag) || 0) + 1);
            });
        });
        const entries = Array.from(counts.entries()).map(([tag, count]) => ({
            tag,
            count,
        }));
        return entries.sort((a, b) => b.count - a.count).slice(0, 10);
    }, [drinks]);

    const totalTags = useMemo(() => {
        const allTags = new Set<string>();
        drinks.forEach((d) => d.tags?.forEach((tag) => allTags.add(tag)));
        return allTags.size;
    }, [drinks]);

    const maxTypeCount = useMemo(() => {
        return Math.max(...typeDistribution.map((d) => d.count), 1);
    }, [typeDistribution]);

    const maxTagCount = useMemo(() => {
        return Math.max(...tagFrequency.map((t) => t.count), 1);
    }, [tagFrequency]);

    return (
        <div className={styles.statsPage}>
            <header className={styles.statsHeader}>
                <h1>{t("title", "Statistics")}</h1>
                <p className={styles.subtitle}>{t("subtitle", "Overview of beverage data")}</p>
            </header>

            {loading && (
                <div className={`${styles.state} ${styles.stateLoading}`} role="status" aria-live="polite">
                    {t("loading", "Loading statistics…")}
                </div>
            )}

            {!loading && error && (
                <div className={`${styles.state} ${styles.stateError}`} role="alert">
                    <p>{t("error.title", "Could not load statistics.")}</p>
                    <pre className={styles.errorMessage}>{error}</pre>
                </div>
            )}

            {!loading && !error && drinks.length === 0 && (
                <div className={`${styles.state} ${styles.stateEmpty}`}>
                    <p>{t("empty.title", "No data available.")}</p>
                    <p className={styles.hint}>{t("empty.hint", "Add beverages to see statistics.")}</p>
                </div>
            )}

            {!loading && !error && drinks.length > 0 && (
                <div className={styles.statsContent}>
                    <div className={styles.statsOverview}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>🍹</div>
                            <div className={styles.statValue}>{drinks.length}</div>
                            <div className={styles.statLabel}>{t("overview.totalBeverages", "Total Beverages")}</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>📂</div>
                            <div className={styles.statValue}>{typeDistribution.length}</div>
                            <div className={styles.statLabel}>{t("overview.types", "Types")}</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>🏷️</div>
                            <div className={styles.statValue}>{totalTags}</div>
                            <div className={styles.statLabel}>{t("overview.uniqueTags", "Unique Tags")}</div>
                        </div>
                    </div>

                    <section className={styles.statSection}>
                        <h2>{t("typeDistribution.title", "Distribution by Type")}</h2>
                        <div className={styles.chart}>
                            {typeDistribution.map(({ type, count, percentage }) => (
                                <div key={type} className={styles.chartRow}>
                                    <div className={styles.chartLabel}>
                                        <span className={styles.labelText}>{type}</span>
                                        <span className={styles.labelCount}>
                                            {count} ({percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <div className={styles.chartBarWrapper}>
                                        <div
                                            className={styles.chartBar}
                                            style={{ width: `${(count / maxTypeCount) * 100}%` }}
                                            aria-label={`${type}: ${count}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {tagFrequency.length > 0 && (
                        <section className={styles.statSection}>
                            <h2>{t("tagFrequency.title", "Most Common Tags")}</h2>
                            <div className={styles.chart}>
                                {tagFrequency.map(({ tag, count }) => (
                                    <div key={tag} className={styles.chartRow}>
                                        <div className={styles.chartLabel}>
                                            <span className={styles.labelText}>{tag}</span>
                                            <span className={styles.labelCount}>{count}</span>
                                        </div>
                                        <div className={styles.chartBarWrapper}>
                                            <div
                                                className={`${styles.chartBar} ${styles.chartBarSecondary}`}
                                                style={{ width: `${(count / maxTagCount) * 100}%` }}
                                                aria-label={`${tag}: ${count}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
