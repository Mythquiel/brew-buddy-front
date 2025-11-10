import {useEffect, useMemo, useState} from "react";
import "../style/beverages.css";
import {useTranslation} from "react-i18next";

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

export default function Beverages() {
    const {t} = useTranslation("beverages");
    const baseUrl = useApiBaseUrl();
    const [drinks, setDrinks] = useState<Beverage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [typeFilter, setTypeFilter] = useState<string>("");
    const [tagInput, setTagInput] = useState<string>("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [searchText, setSearchText] = useState<string>("");

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

    const allTypes = useMemo(() => {
        const set = new Set<string>();
        drinks.forEach((d) => d.type && set.add(d.type));
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [drinks]);

    const allTags = useMemo(() => {
        const set = new Set<string>();
        drinks.forEach((d) => d.tags?.forEach((tag) => set.add(tag)));
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [drinks]);

    const filteredDrinks = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        return drinks.filter((d) => {
            if (typeFilter && d.type !== typeFilter) return false;
            if (selectedTags.length > 0) {
                const tags = new Set((d.tags ?? []).map((t) => t.toLowerCase()));
                for (const t of selectedTags) {
                    if (!tags.has(t.toLowerCase())) return false;
                }
            }
            if (q) {
                const nameMatch = d.name.toLowerCase().includes(q);
                const typeMatch = d.type.toLowerCase().includes(q);
                const tagsMatch = (d.tags ?? []).some((t) => t.toLowerCase().includes(q));
                return nameMatch || typeMatch || tagsMatch;
            }
            return true;
        });
    }, [drinks, typeFilter, selectedTags, searchText]);

    const addTag = (raw: string) => {
        const tag = raw.trim();
        if (!tag) return;
        if (!selectedTags.includes(tag)) setSelectedTags((prev) => [...prev, tag]);
        setTagInput("");
    };

    //TODO fix removing tag as it removes all tags
    const removeTag = (tag: string) => setSelectedTags((prev) => prev.filter((t) => t !== tag));

    const onTagKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(tagInput);
        } else if (e.key === "Backspace" && tagInput === "" && selectedTags.length > 0) {
            removeTag(selectedTags[selectedTags.length - 1]);
        }
    };

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
                                placeholder={t("filters.searchPlaceholder", "Search by name, type or tag")}
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
                        <label className="filter tags-filter">
                            <span className="filter-label">{t("filters.tags", "Tags")}</span>
                            <div className="tags-input">
                                <div className="chips">
                                    {selectedTags.map((tag) => (
                                        <span className="chip" key={tag}>
                      {tag}
                                            <button type="button" className="chip-remove"
                                                    aria-label={t("filters.removeTag", {
                                                        defaultValue: "Remove {{tag}}",
                                                        tag
                                                    })} onClick={() => removeTag(tag)}>×</button>
                    </span>
                                    ))}
                                </div>
                                <input
                                    list="all-tags"
                                    type="text"
                                    placeholder={t("filters.tagsPlaceholder", "Type a tag and press Enter")}
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={onTagKeyDown}
                                />
                                <datalist id="all-tags">
                                    {allTags.map((tag) => (
                                        <option key={tag} value={tag}/>
                                    ))}
                                </datalist>
                            </div>
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
                                {b.imageUrl ? (
                                    <img src={b.imageUrl} alt=""/>
                                ) : (
                                    <div className="placeholder" aria-hidden>
                                        <span role="img" aria-label="drink">🍵</span>
                                    </div>
                                )}
                            </div>
                            <div className="content">
                                <h3 className="name">{b.name}</h3>
                                {b.type && <div className="type">{b.type}</div>}
                                {b.tags && b.tags.length > 0 && (
                                    <div className="tags" aria-label="Tags">
                                        {b.tags.map((tag) => (
                                            <span className="tag" key={tag}>{tag}</span>
                                        ))}
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