import {useEffect, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import { optionalAuthenticatedFetch } from "../services/apiClient";

interface Beverage {
    id: string;
    type: string;
    name: string;
    brand?: string;
    brewTimeMinSec?: number;
    brewTimeMaxSec?: number;
    imageUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface BeverageWithSignedUrl extends Beverage {
    signedImageUrl?: string;
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
    const [drinks, setDrinks] = useState<BeverageWithSignedUrl[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [typeFilter, setTypeFilter] = useState<string>("");
    const [searchText, setSearchText] = useState<string>("");
    const [brandFilter, setBrandFilter] = useState<string>("");
    const [selectedBeverage, setSelectedBeverage] = useState<BeverageWithSignedUrl | null>(null);

    useEffect(() => {
    }, [baseUrl]);

    const handleImageError = async (beverageId: string, event: React.SyntheticEvent<HTMLImageElement>) => {
        const img = event.currentTarget;

        if (img.dataset.retryCount && parseInt(img.dataset.retryCount) > 2) {
            console.error(`Failed to load image after retries for beverage ${beverageId}`);
            return;
        }

        try {
            const response = await optionalAuthenticatedFetch(`${baseUrl}/api/v1/beverages/${beverageId}/image-url`);
            if (response.ok) {
                const newSignedUrl = await response.text();
                setDrinks(prevDrinks =>
                    prevDrinks.map(drink =>
                        drink.id === beverageId
                            ? { ...drink, signedImageUrl: newSignedUrl }
                            : drink
                    )
                );
                img.dataset.retryCount = String((parseInt(img.dataset.retryCount || '0') + 1));
            }
        } catch (err) {
            console.error(`Failed to refresh signed URL for ${beverageId}:`, err);
        }
    };

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();
                params.append("size", "1000");

                const url = `${baseUrl}/api/v1/beverages?${params.toString()}`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data: BeveragePageResponse = await response.json();

                setDrinks(data.content);

                data.content.forEach(async (beverage) => {
                    if (!beverage.imageUrl) {
                        return;
                    }

                    try {
                        const imageResponse = await optionalAuthenticatedFetch(`${baseUrl}/api/v1/beverages/${beverage.id}/image-url`);

                        if (!imageResponse.ok) {
                            console.error(`Failed to fetch image for ${beverage.name}: HTTP ${imageResponse.status}`);
                            return;
                        }

                        const signedUrl = await imageResponse.text();
                        setDrinks(prevDrinks =>
                            prevDrinks.map(drink =>
                                drink.id === beverage.id
                                    ? { ...drink, signedImageUrl: signedUrl }
                                    : drink
                            )
                        );
                    } catch (err) {
                        console.error(`Failed to fetch image for ${beverage.name}:`, err);
                    }
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
                setDrinks([]);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [baseUrl]);

    const allTypes = ["TEA", "COFFEE", "OTHER"];

    const allBrands = useMemo(() => {
        const set = new Set<string>();
        drinks.forEach((d) => {
            if (typeFilter && d.type !== typeFilter) return;
            if (d.brand) set.add(d.brand);
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [drinks, typeFilter]);

    useEffect(() => {
        if (brandFilter && !allBrands.includes(brandFilter)) {
            setBrandFilter("");
        }
    }, [allBrands, brandFilter]);

    const filteredDrinks = useMemo(() => {
        return drinks.filter((d) => {
            if (typeFilter && d.type !== typeFilter) return false;

            if (brandFilter && d.brand !== brandFilter) return false;

            if (searchText) {
                const search = searchText.toLowerCase();
                const nameMatch = d.name.toLowerCase().includes(search);
                const brandMatch = d.brand?.toLowerCase().includes(search);
                if (!nameMatch && !brandMatch) return false;
            }

            return true;
        });
    }, [drinks, typeFilter, brandFilter, searchText]);

    return (
        <div className="grid gap-5 pb-8">
            <header className="flex flex-col gap-2">
                <form className="mt-1" onSubmit={(e) => e.preventDefault()}
                      aria-label={t("filters.aria", "Filters")}>
                    <div className="grid grid-cols-1 sm:grid-cols-[1.3fr_160px_1.5fr] sm:items-end gap-2">
                        <label className="grid gap-1">
                            <span className="text-sm text-[var(--color-neutral-slate)]">{t("filters.search", "Search")}</span>
                            <input
                                type="search"
                                placeholder={t("filters.searchPlaceholder", "Search by name")}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                aria-label={t("filters.search", "Search")}
                                className="w-full px-3 py-2 rounded-[var(--radius-lg)] border border-[rgba(216,243,220,0.18)] bg-black/25 text-[var(--color-green-pale)] appearance-none"
                            />
                        </label>
                        <label className="grid gap-1">
                            <span className="text-sm text-[var(--color-neutral-slate)]">{t("filters.type", "Type")}</span>
                            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                                    aria-label={t("filters.type", "Type")}
                                    className="w-full px-3 py-2 rounded-[var(--radius-lg)] border border-[rgba(216,243,220,0.18)] bg-black/25 text-[var(--color-green-pale)]">
                                <option value="">{t("filters.anyType", "Any type")}</option>
                                {allTypes.map((tVal) => (
                                    <option key={tVal} value={tVal}>{t(`types.${tVal}`, tVal)}</option>
                                ))}
                            </select>
                        </label>
                        <label className="grid gap-1">
                            <span className="text-sm text-[var(--color-neutral-slate)]">{t("filters.brand", "Brand")}</span>
                            <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}
                                    aria-label={t("filters.brand", "Brand")}
                                    className="w-full px-3 py-2 rounded-[var(--radius-lg)] border border-[rgba(216,243,220,0.18)] bg-black/25 text-[var(--color-green-pale)]">
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
                <div className="bg-[rgba(216,243,220,0.04)] border border-[rgba(216,243,220,0.1)] rounded-xl p-4 px-5" role="status" aria-live="polite">
                    {t("loading", "Loading beverages…")}
                </div>
            )}

            {!loading && error && (
                <div className="bg-[rgba(255,99,132,0.06)] border border-[rgba(255,99,132,0.35)] rounded-xl p-4 px-5" role="alert">
                    <p>{t("error.title", "Could not load beverages.")}</p>
                    <pre className="whitespace-pre-wrap font-mono text-sm mt-2 text-[#ffb3c1]">{error}</pre>
                </div>
            )}

            {!loading && !error && filteredDrinks.length === 0 && (
                <div className="bg-[rgba(216,243,220,0.04)] border border-[rgba(216,243,220,0.1)] rounded-xl p-4 px-5 opacity-90">
                    <p>{t("empty.title", "No beverages found.")}</p>
                    <p className="hint">{t("empty.hint", "Try adjusting filters or add drinks in your backend.")}</p>
                </div>
            )}

            {!loading && !error && filteredDrinks.length > 0 && (
                <ul className="list-none grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 p-0 m-0 sm:gap-[1.1rem] md:gap-5" aria-label={t("list.aria", "Beverages list")}>
                    {filteredDrinks.map((b) => (
                        <li
                            key={b.id}
                            className="bg-[rgba(216,243,220,0.04)] border border-[rgba(216,243,220,0.1)] rounded-[14px] overflow-hidden flex flex-col transition-all duration-100 ease-[ease] cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(0,0,0,0.35)] hover:border-[rgba(216,243,220,0.22)]"
                            onClick={() => setSelectedBeverage(b)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setSelectedBeverage(b);
                                }
                            }}
                        >
                            <div className="aspect-video bg-gradient-to-b from-black/[0.22] to-black/[0.08] grid place-items-center overflow-hidden relative min-h-[200px]" aria-hidden>
                                {b.signedImageUrl ? (
                                    <img
                                        src={b.signedImageUrl}
                                        alt={b.name}
                                        loading="lazy"
                                        onError={(e) => handleImageError(b.id, e)}
                                        className="w-full h-full object-cover object-center block absolute top-0 left-0"
                                    />
                                ) : (
                                    <div className="text-[2rem] opacity-80" aria-hidden>
                                        <span role="img" aria-label="drink">
                                            {b.type === "COFFEE" ? "☕" : b.type === "TEA" ? "🍵" : "🥤"}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-[0.85rem] px-4 pb-4 grid gap-[0.35rem]">
                                <h3 className="m-0 text-[1.05rem]">{b.name}</h3>
                                {b.type && <div className="text-[0.85rem] text-[var(--color-neutral-slate)]">{t(`types.${b.type}`, b.type)}</div>}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {selectedBeverage && (
                <div
                    className="fixed inset-0 bg-black/85 backdrop-blur flex items-center justify-center p-4 z-[1000] animate-[fadeIn_0.2s_ease]"
                    onClick={() => setSelectedBeverage(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div
                        className="bg-[rgba(216,243,220,0.08)] border border-[rgba(216,243,220,0.2)] rounded-xl max-w-[480px] w-full max-h-[85vh] overflow-y-auto relative animate-[slideUp_0.3s_ease]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-[16px] right-[16px] bg-black/50 border border-[rgba(216,243,220,0.2)] text-[var(--color-green-pale)] w-8 h-8 rounded-md flex items-center justify-center text-2xl leading-none cursor-pointer transition-all duration-100 z-10 hover:bg-black/70 hover:border-[rgba(216,243,220,0.35)] hover:scale-110"
                            onClick={() => setSelectedBeverage(null)}
                            aria-label={t("modal.close", "Close")}
                        >
                            ×
                        </button>

                        {selectedBeverage.signedImageUrl ? (
                            <div className="w-full aspect-video overflow-hidden bg-gradient-to-b from-black/30 to-black/10 rounded-t-xl">
                                <img
                                    src={selectedBeverage.signedImageUrl}
                                    alt={selectedBeverage.name}
                                    onError={(e) => handleImageError(selectedBeverage.id, e)}
                                    className="w-full h-full object-cover block"
                                />
                            </div>
                        ) : (
                            <div className="w-full aspect-video flex items-center justify-center bg-gradient-to-b from-black/30 to-black/10 rounded-t-xl text-[4rem] opacity-60">
                                <span role="img" aria-label="drink">
                                    {selectedBeverage.type === "COFFEE" ? "☕" : selectedBeverage.type === "TEA" ? "🍵" : "🥤"}
                                </span>
                            </div>
                        )}

                        <div className="p-6 grid gap-4">
                            <h2 id="modal-title" className="m-0 text-2xl text-[var(--color-green-pale)] pb-2 border-b border-[rgba(216,243,220,0.15)]">{selectedBeverage.name}</h2>

                            {selectedBeverage.type && (
                                <div className="grid grid-cols-[auto_1fr] gap-3 items-baseline text-base">
                                    <span className="text-[var(--color-neutral-slate)] font-medium whitespace-nowrap">{t("modal.type", "Type")}:</span>
                                    <span>{t(`types.${selectedBeverage.type}`, selectedBeverage.type)}</span>
                                </div>
                            )}

                            {selectedBeverage.brand && (
                                <div className="grid grid-cols-[auto_1fr] gap-3 items-baseline text-base">
                                    <span className="text-[var(--color-neutral-slate)] font-medium whitespace-nowrap">{t("modal.brand", "Brand")}:</span>
                                    <span>{selectedBeverage.brand}</span>
                                </div>
                            )}

                            {(selectedBeverage.brewTimeMinSec !== undefined || selectedBeverage.brewTimeMaxSec !== undefined) && (
                                <div className="grid grid-cols-[auto_1fr] gap-3 items-baseline text-base">
                                    <span className="text-[var(--color-neutral-slate)] font-medium whitespace-nowrap">{t("modal.brewTime", "Brew time")}:</span>
                                    <span>
                                        {selectedBeverage.brewTimeMinSec !== undefined && selectedBeverage.brewTimeMaxSec !== undefined
                                            ? `${Math.floor(selectedBeverage.brewTimeMinSec / 60)}:${(selectedBeverage.brewTimeMinSec % 60).toString().padStart(2, '0')} - ${Math.floor(selectedBeverage.brewTimeMaxSec / 60)}:${(selectedBeverage.brewTimeMaxSec % 60).toString().padStart(2, '0')}`
                                            : selectedBeverage.brewTimeMinSec !== undefined
                                            ? `${Math.floor(selectedBeverage.brewTimeMinSec / 60)}:${(selectedBeverage.brewTimeMinSec % 60).toString().padStart(2, '0')}`
                                            : `${Math.floor(selectedBeverage.brewTimeMaxSec! / 60)}:${(selectedBeverage.brewTimeMaxSec! % 60).toString().padStart(2, '0')}`
                                        }
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
