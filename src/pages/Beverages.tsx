import { useEffect, useMemo, useState } from "react";
import "../style/beverages.css";

interface Beverage {
  id: string;
  type: string;
  name: string;
  teaCategory?: string;
  tags?: string[];
  imageUrl?: string;
}

function useApiBaseUrl() {
  return useMemo(() => {
    const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;

    if (fromEnv && typeof fromEnv === "string" && fromEnv.trim().length > 0) {
      return fromEnv.replace(/\/$/, "");
    }
    return "";
  }, []);
}

export default function Beverages() {
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
        }
    ];

  useEffect(() => {
      async function load() {
          setLoading(false);
          setError(null);
          setDrinks(SAMPLE_BEVERAGES);
      }

    load();
  }, [baseUrl]);

  return (
    <div className="beverages-page">
      <header className="beverages-header">
        <h1>My Drinks</h1>
        <p className="subtitle">Explore your beverages collection</p>
      </header>

      {loading && (
        <div className="state state-loading" role="status" aria-live="polite">
          Loading beverages…
        </div>
      )}

      {!loading && error && (
        <div className="state state-error" role="alert">
          <p>Could not load beverages.</p>
          <pre className="error-message">{error}</pre>
        </div>
      )}

      {!loading && !error && drinks.length === 0 && (
        <div className="state state-empty">
          <p>No beverages found yet.</p>
          <p className="hint">Add some drinks in your backend to see them here.</p>
        </div>
      )}

      {!loading && !error && drinks.length > 0 && (
        <ul className="beverages-grid" aria-label="Beverages list">
          {drinks.map((b) => (
            <li key={b.id} className="beverage-card">
              <div className="thumb" aria-hidden>
                {b.imageUrl ? (
                  <img src={b.imageUrl} alt="" />
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