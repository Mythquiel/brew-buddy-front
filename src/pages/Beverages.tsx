import {useEffect, useMemo, useState} from "react";
import styles from "../style/beverages.module.css";
import {useTranslation} from "react-i18next";

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

    const handleImageError = async (beverageId: string, event: React.SyntheticEvent<HTMLImageElement>) => {
        const img = event.currentTarget;

        if (img.dataset.retryCount && parseInt(img.dataset.retryCount) > 2) {
            console.error(`Failed to load image after retries for beverage ${beverageId}`);
            return;
        }

        try {
            const response = await fetch(`${baseUrl}/api/v1/beverages/${beverageId}/image-url`);
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

                const beveragesWithImages = await Promise.all(
                    data.content.map(async (beverage) => {
                        if (beverage.imageUrl) {
                            try {
                                const imageResponse = await fetch(
                                    `${baseUrl}/api/v1/beverages/${beverage.id}/image-url`
                                );
                                if (imageResponse.ok) {
                                    const signedUrl = await imageResponse.text();
                                    return { ...beverage, signedImageUrl: signedUrl };
                                }
                            } catch (err) {
                                console.error(`Failed to fetch image for ${beverage.name}:`, err);
                            }
                        }
                        return beverage;
                    })
                );

                setDrinks(beveragesWithImages);
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
        <div className={styles.beveragesPage}>
            <header className={styles.beveragesHeader}>
                <form className={styles.filters} onSubmit={(e) => e.preventDefault()}
                      aria-label={t("filters.aria", "Filters")}>
                    <div className={styles.filtersRow}>
                        <label className={`${styles.filter} ${styles.searchFilter}`}>
                            <span className={styles.filterLabel}>{t("filters.search", "Search")}</span>
                            <input
                                type="search"
                                placeholder={t("filters.searchPlaceholder", "Search by name")}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                aria-label={t("filters.search", "Search")}
                            />
                        </label>
                        <label className={styles.filter}>
                            <span className={styles.filterLabel}>{t("filters.type", "Type")}</span>
                            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                                    aria-label={t("filters.type", "Type")}>
                                <option value="">{t("filters.anyType", "Any type")}</option>
                                {allTypes.map((tVal) => (
                                    <option key={tVal} value={tVal}>{t(`types.${tVal}`, tVal)}</option>
                                ))}
                            </select>
                        </label>
                        <label className={styles.filter}>
                            <span className={styles.filterLabel}>{t("filters.brand", "Brand")}</span>
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
                <div className={styles.state} role="status" aria-live="polite">
                    {t("loading", "Loading beverages…")}
                </div>
            )}

            {!loading && error && (
                <div className={`${styles.state} ${styles.stateError}`} role="alert">
                    <p>{t("error.title", "Could not load beverages.")}</p>
                    <pre className={styles.errorMessage}>{error}</pre>
                </div>
            )}

            {!loading && !error && filteredDrinks.length === 0 && (
                <div className={`${styles.state} ${styles.stateEmpty}`}>
                    <p>{t("empty.title", "No beverages found.")}</p>
                    <p className="hint">{t("empty.hint", "Try adjusting filters or add drinks in your backend.")}</p>
                </div>
            )}

            {!loading && !error && filteredDrinks.length > 0 && (
                <ul className={styles.beveragesGrid} aria-label={t("list.aria", "Beverages list")}>
                    {filteredDrinks.map((b) => (
                        <li
                            key={b.id}
                            className={styles.beverageCard}
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
                            <div className={styles.thumb} aria-hidden>
                                {b.signedImageUrl ? (
                                    <img
                                        src={b.signedImageUrl}
                                        alt={b.name}
                                        loading="lazy"
                                        onError={(e) => handleImageError(b.id, e)}
                                    />
                                ) : (
                                    <div className={styles.placeholder} aria-hidden>
                                        <span role="img" aria-label="drink">
                                            {b.type === "COFFEE" ? "☕" : b.type === "TEA" ? "🍵" : "🥤"}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className={styles.content}>
                                <h3 className={styles.name}>{b.name}</h3>
                                {b.type && <div className={styles.type}>{t(`types.${b.type}`, b.type)}</div>}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {selectedBeverage && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setSelectedBeverage(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className={styles.modalClose}
                            onClick={() => setSelectedBeverage(null)}
                            aria-label={t("modal.close", "Close")}
                        >
                            ×
                        </button>

                        {selectedBeverage.signedImageUrl ? (
                            <div className={styles.modalImage}>
                                <img
                                    src={selectedBeverage.signedImageUrl}
                                    alt={selectedBeverage.name}
                                    onError={(e) => handleImageError(selectedBeverage.id, e)}
                                />
                            </div>
                        ) : (
                            <div className={styles.modalImagePlaceholder}>
                                <span role="img" aria-label="drink">
                                    {selectedBeverage.type === "COFFEE" ? "☕" : selectedBeverage.type === "TEA" ? "🍵" : "🥤"}
                                </span>
                            </div>
                        )}

                        <div className={styles.modalDetails}>
                            <h2 id="modal-title" className={styles.modalName}>{selectedBeverage.name}</h2>

                            {selectedBeverage.type && (
                                <div className={styles.modalField}>
                                    <span className={styles.modalLabel}>{t("modal.type", "Type")}:</span>
                                    <span>{t(`types.${selectedBeverage.type}`, selectedBeverage.type)}</span>
                                </div>
                            )}

                            {selectedBeverage.brand && (
                                <div className={styles.modalField}>
                                    <span className={styles.modalLabel}>{t("modal.brand", "Brand")}:</span>
                                    <span>{selectedBeverage.brand}</span>
                                </div>
                            )}

                            {(selectedBeverage.brewTimeMinSec !== undefined || selectedBeverage.brewTimeMaxSec !== undefined) && (
                                <div className={styles.modalField}>
                                    <span className={styles.modalLabel}>{t("modal.brewTime", "Brew time")}:</span>
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