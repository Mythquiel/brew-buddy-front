import {useEffect, useMemo, useState} from "react";
import "../style/beverages.css";
import {useTranslation} from "react-i18next";

interface Beverage {
    id: string;
    type: string;
    name: string;
    brand?: string;
    brewTimeMinSec?: number;
    brewTimeMaxSec?: number;
    createdAt?: string;
    updatedAt?: string;
}

interface BeveragePageResponse {
    content: Beverage[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
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

export default function Beverages() {
    const {t} = useTranslation("beverages");
    const baseUrl = useApiBaseUrl();
    const [drinks, setDrinks] = useState<Beverage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [typeFilter, setTypeFilter] = useState<string>("");
    const [searchText, setSearchText] = useState<string>("");
    const [brandFilter, setBrandFilter] = useState<string>("");

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();
                if (typeFilter) params.append("type", typeFilter);
                if (searchText) params.append("nameContains", searchText);
                params.append("size", "100");

                const url = `${baseUrl}/api/v1/beverages?${params.toString()}`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data: BeveragePageResponse = await response.json();
                setDrinks(data.content);
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
                setDrinks([]);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [baseUrl, typeFilter, searchText]);

    const allTypes = ["TEA", "COFFEE", "OTHER"];

    const allBrands = useMemo(() => {
        const set = new Set<string>();
        drinks.forEach((d) => d.brand && set.add(d.brand));
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [drinks]);

    const filteredDrinks = useMemo(() => {
        return drinks.filter((d) => {
            if (brandFilter && d.brand !== brandFilter) return false;
            return true;
        });
    }, [drinks, brandFilter]);

    return (
        <div className="beverages-page">
            <header className="beverages-header">
                <form className="filters" onSubmit={(e) => e.preventDefault()}
                      aria-label={t("filters.aria", "Filters")}>
                    <div className="filters-row">
                        <label className="filter search-filter">
                            <span className="filter-label">{t("filters.search", "Search")}</span>
                            <input
                                type="search"
                                placeholder={t("filters.searchPlaceholder", "Search by name")}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                aria-label={t("filters.search", "Search")}
                            />
                        </label>
                        <label className="filter">
                            <span className="filter-label">{t("filters.type", "Type")}</span>
                            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                                    aria-label={t("filters.type", "Type")}>
                                <option value="">{t("filters.anyType", "Any type")}</option>
                                {allTypes.map((tVal) => (
                                    <option key={tVal} value={tVal}>{tVal}</option>
                                ))}
                            </select>
                        </label>
                        <label className="filter">
                            <span className="filter-label">{t("filters.brand", "Brand")}</span>
                            <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}
                                    aria-label={t("filters.brand", "Brand")}>
                                <option value="">{t("filters.anyBrand", "Any brand")}</option>
                                {allBrands.map((brand) => (
                                    <option key={brand} value={brand}>{brand}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </form>
            </header>

            {loading && (
                <div className="state state-loading" role="status" aria-live="polite">
                    {t("loading", "Loading beverages…")}
                </div>
            )}

            {!loading && error && (
                <div className="state state-error" role="alert">
                    <p>{t("error.title", "Could not load beverages.")}</p>
                    <pre className="error-message">{error}</pre>
                </div>
            )}

            {!loading && !error && filteredDrinks.length === 0 && (
                <div className="state state-empty">
                    <p>{t("empty.title", "No beverages found.")}</p>
                    <p className="hint">{t("empty.hint", "Try adjusting filters or add drinks in your backend.")}</p>
                </div>
            )}

            {!loading && !error && filteredDrinks.length > 0 && (
                <ul className="beverages-grid" aria-label={t("list.aria", "Beverages list")}>
                    {filteredDrinks.map((b) => (
                        <li key={b.id} className="beverage-card">
                            <div className="thumb" aria-hidden>
                                <div className="placeholder" aria-hidden>
                                    <span role="img" aria-label="drink">
                                        {b.type === "COFFEE" ? "☕" : b.type === "TEA" ? "🍵" : "🥤"}
                                    </span>
                                </div>
                            </div>
                            <div className="content">
                                <h3 className="name">{b.name}</h3>
                                {b.type && <div className="type">{b.type}</div>}
                                {b.brand && <div className="brand">{t("card.brand", "Brand")}: {b.brand}</div>}
                                {(b.brewTimeMinSec !== undefined || b.brewTimeMaxSec !== undefined) && (
                                    <div className="brew-time">
                                        {t("card.brewTime", "Brew time")}:
                                        {b.brewTimeMinSec !== undefined && b.brewTimeMaxSec !== undefined
                                            ? ` ${Math.floor(b.brewTimeMinSec / 60)}:${(b.brewTimeMinSec % 60).toString().padStart(2, '0')} - ${Math.floor(b.brewTimeMaxSec / 60)}:${(b.brewTimeMaxSec % 60).toString().padStart(2, '0')}`
                                            : b.brewTimeMinSec !== undefined
                                            ? ` ${Math.floor(b.brewTimeMinSec / 60)}:${(b.brewTimeMinSec % 60).toString().padStart(2, '0')}`
                                            : ` ${Math.floor(b.brewTimeMaxSec! / 60)}:${(b.brewTimeMaxSec! % 60).toString().padStart(2, '0')}`
                                        }
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}