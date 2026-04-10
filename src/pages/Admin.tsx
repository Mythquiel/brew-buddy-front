import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

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

interface BeverageFormData {
    type: string;
    name: string;
    brand: string;
    brewTimeMinSec: string;
    brewTimeMaxSec: string;
    imageFile: File | null;
}

type ModalMode = 'add' | 'edit' | null;

function useApiBaseUrl() {
    return useMemo(() => {
        const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;
        if (fromEnv && fromEnv.trim().length > 0) {
            return fromEnv.replace(/\/$/, "");
        }
        return "";
    }, []);
}

type SortField = 'name' | 'type' | 'brand';
type SortDirection = 'asc' | 'desc';

export default function Admin() {
    const { t } = useTranslation("beverages");
    const baseUrl = useApiBaseUrl();
    const [beverages, setBeverages] = useState<Beverage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [selectedBeverage, setSelectedBeverage] = useState<Beverage | null>(null);
    const [formData, setFormData] = useState<BeverageFormData>({
        type: 'COFFEE',
        name: '',
        brand: '',
        brewTimeMinSec: '',
        brewTimeMaxSec: '',
        imageFile: null
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    useEffect(() => {
        loadBeverages();
    }, [baseUrl]);

    const loadBeverages = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${baseUrl}/api/v1/beverages?size=1000`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            setBeverages(data.content || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setFormData({
            type: 'COFFEE',
            name: '',
            brand: '',
            brewTimeMinSec: '',
            brewTimeMaxSec: '',
            imageFile: null
        });
        setImagePreview(null);
        setSelectedBeverage(null);
        setModalMode('add');
    };

    const openEditModal = async (beverage: Beverage) => {
        setFormData({
            type: beverage.type,
            name: beverage.name,
            brand: beverage.brand || '',
            brewTimeMinSec: beverage.brewTimeMinSec?.toString() || '',
            brewTimeMaxSec: beverage.brewTimeMaxSec?.toString() || '',
            imageFile: null
        });

        // Always try to load current image
        try {
            const response = await fetch(`${baseUrl}/api/v1/beverages/${beverage.id}/image-url`);
            if (response.ok) {
                const signedUrl = await response.text();
                if (signedUrl && signedUrl.trim().length > 0) {
                    setImagePreview(signedUrl);
                    // Update beverage object with imageUrl flag
                    beverage.imageUrl = signedUrl;
                } else {
                    setImagePreview(null);
                }
            } else {
                setImagePreview(null);
            }
        } catch (err) {
            console.error('Failed to load current image:', err);
            setImagePreview(null);
        }

        setSelectedBeverage(beverage);
        setModalMode('edit');
    };

    const closeModal = () => {
        setModalMode(null);
        setSelectedBeverage(null);
        setImagePreview(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, imageFile: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const payload: any = {
                type: formData.type,
                name: formData.name,
                brand: formData.brand || null,
                brewTimeMinSec: formData.brewTimeMinSec ? parseInt(formData.brewTimeMinSec) : null,
                brewTimeMaxSec: formData.brewTimeMaxSec ? parseInt(formData.brewTimeMaxSec) : null
            };

            let beverageId: string;

            if (modalMode === 'add') {
                const response = await fetch(`${baseUrl}/api/v1/beverages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json',
                               'Authorization': `Bearer ${localStorage.getItem("brew_buddy_access_token")}` },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const newBeverage = await response.json();
                beverageId = newBeverage.id;
            } else if (modalMode === 'edit' && selectedBeverage) {
                const response = await fetch(`${baseUrl}/api/v1/beverages/${selectedBeverage.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem("brew_buddy_access_token")}` },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                beverageId = selectedBeverage.id;
            } else {
                throw new Error('Invalid state');
            }

            // Upload image if provided
            if (formData.imageFile) {
                const imageFormData = new FormData();
                imageFormData.append('image', formData.imageFile);

                const imageResponse = await fetch(`${baseUrl}/api/v1/beverages/${beverageId}/image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("brew_buddy_access_token")}`
                    },
                    body: imageFormData
                });
                if (!imageResponse.ok) throw new Error(`Image upload failed: HTTP ${imageResponse.status}`);
            }

            await loadBeverages();
            closeModal();
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (beverage: Beverage) => {
        if (!confirm(t("admin.actions.deleteConfirm", { name: beverage.name }))) return;

        try {
            const response = await fetch(`${baseUrl}/api/v1/beverages/${beverage.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("brew_buddy_access_token")}`
                }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            await loadBeverages();
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    const handleDeleteImage = async () => {
        if (!selectedBeverage?.id || !confirm(t("admin.form.deleteConfirm"))) return;

        try {
            const response = await fetch(`${baseUrl}/api/v1/beverages/${selectedBeverage.id}/image`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("brew_buddy_access_token")}`
                }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            setImagePreview(null);
            setSelectedBeverage({ ...selectedBeverage, imageUrl: undefined });
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const filteredAndSortedBeverages = useMemo(() => {
        let filtered = beverages.filter((b) => {
            if (typeFilter && b.type !== typeFilter) return false;
            if (searchText) {
                const search = searchText.toLowerCase();
                const nameMatch = b.name.toLowerCase().includes(search);
                const brandMatch = b.brand?.toLowerCase().includes(search);
                if (!nameMatch && !brandMatch) return false;
            }
            return true;
        });

        filtered.sort((a, b) => {
            let compareA = '';
            let compareB = '';

            if (sortField === 'name') {
                compareA = a.name.toLowerCase();
                compareB = b.name.toLowerCase();
            } else if (sortField === 'type') {
                compareA = a.type.toLowerCase();
                compareB = b.type.toLowerCase();
            } else if (sortField === 'brand') {
                compareA = (a.brand || '').toLowerCase();
                compareB = (b.brand || '').toLowerCase();
            }

            if (sortDirection === 'asc') {
                return compareA.localeCompare(compareB);
            } else {
                return compareB.localeCompare(compareA);
            }
        });

        return filtered;
    }, [beverages, searchText, typeFilter, sortField, sortDirection]);

    const renderModal = () => {
        if (!modalMode) return null;

        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[1001] p-4 animate-[fadeInBackdrop_0.3s_ease-out]" onClick={closeModal}>
                <div className="relative bg-gradient-to-br from-[#0f2018] to-[#081610] border border-brew-accent/20 rounded-[20px] px-8 py-7 max-w-[600px] w-full max-h-[85vh] overflow-y-auto shadow-[0_8px_32px_rgba(0,0,0,0.4),0_16px_64px_rgba(0,0,0,0.3)] animate-[slideUp_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
                    <button
                        className="absolute top-[20px] right-[20px] bg-brew-accent/15 border-none text-brew-lightest w-9 h-9 rounded-full text-xl cursor-pointer flex items-center justify-center transition-all duration-200 z-10 hover:bg-brew-accent/25 hover:scale-110"
                        onClick={closeModal}
                        aria-label="Close"
                    >
                        ✕
                    </button>

                    <h3 className="text-2xl font-semibold text-brew-lightest m-0 mb-5 pr-10">
                        {modalMode === 'add' ? t("admin.addModalTitle") : t("admin.editModalTitle")}
                    </h3>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="type" className="block text-[0.8125rem] font-medium text-brew-pale mb-1.5 uppercase tracking-wide">{t("admin.form.type")}</label>
                            <select
                                id="type"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                required
                                className="w-full px-3.5 py-2.5 bg-black/30 border border-brew-accent/20 rounded-[10px] text-brew-lightest text-[0.9375rem] transition-all duration-200 focus:outline-none focus:border-brew-accent focus:shadow-[0_0_0_3px_rgba(130,165,132,0.15)] focus:bg-black/40"
                            >
                                <option value="COFFEE">{t("types.COFFEE")}</option>
                                <option value="TEA">{t("types.TEA")}</option>
                                <option value="OTHER">{t("types.OTHER")}</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-[0.8125rem] font-medium text-brew-pale mb-1.5 uppercase tracking-wide">{t("admin.form.nameRequired")}</label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full px-3.5 py-2.5 bg-black/30 border border-brew-accent/20 rounded-[10px] text-brew-lightest text-[0.9375rem] transition-all duration-200 focus:outline-none focus:border-brew-accent focus:shadow-[0_0_0_3px_rgba(130,165,132,0.15)] focus:bg-black/40 placeholder:text-brew-accent/50"
                                placeholder={t("admin.form.namePlaceholder")}
                            />
                        </div>

                        <div>
                            <label htmlFor="brand" className="block text-[0.8125rem] font-medium text-brew-pale mb-1.5 uppercase tracking-wide">{t("admin.form.brand")}</label>
                            <input
                                type="text"
                                id="brand"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-black/30 border border-brew-accent/20 rounded-[10px] text-brew-lightest text-[0.9375rem] transition-all duration-200 focus:outline-none focus:border-brew-accent focus:shadow-[0_0_0_3px_rgba(130,165,132,0.15)] focus:bg-black/40 placeholder:text-brew-accent/50"
                                placeholder={t("admin.form.brandPlaceholder")}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="brewTimeMin" className="block text-[0.8125rem] font-medium text-brew-pale mb-1.5 uppercase tracking-wide">{t("admin.form.brewTimeMin")}</label>
                                <input
                                    type="number"
                                    id="brewTimeMin"
                                    value={formData.brewTimeMinSec}
                                    onChange={(e) => setFormData({ ...formData, brewTimeMinSec: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-black/30 border border-brew-accent/20 rounded-[10px] text-brew-lightest text-[0.9375rem] transition-all duration-200 focus:outline-none focus:border-brew-accent focus:shadow-[0_0_0_3px_rgba(130,165,132,0.15)] focus:bg-black/40 placeholder:text-brew-accent/50"
                                    placeholder={t("admin.form.brewTimeMinPlaceholder")}
                                />
                            </div>
                            <div>
                                <label htmlFor="brewTimeMax" className="block text-[0.8125rem] font-medium text-brew-pale mb-1.5 uppercase tracking-wide">{t("admin.form.brewTimeMax")}</label>
                                <input
                                    type="number"
                                    id="brewTimeMax"
                                    value={formData.brewTimeMaxSec}
                                    onChange={(e) => setFormData({ ...formData, brewTimeMaxSec: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-black/30 border border-brew-accent/20 rounded-[10px] text-brew-lightest text-[0.9375rem] transition-all duration-200 focus:outline-none focus:border-brew-accent focus:shadow-[0_0_0_3px_rgba(130,165,132,0.15)] focus:bg-black/40 placeholder:text-brew-accent/50"
                                    placeholder={t("admin.form.brewTimeMaxPlaceholder")}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="image" className="block text-[0.8125rem] font-medium text-brew-pale mb-1.5 uppercase tracking-wide">
                                {t("admin.form.image")} {modalMode === 'edit' && selectedBeverage?.imageUrl && t("admin.form.imageReplace")}
                            </label>
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full px-3.5 py-2.5 bg-black/30 border border-brew-accent/20 rounded-[10px] text-brew-lightest text-[0.9375rem] transition-all duration-200 focus:outline-none focus:border-brew-accent focus:shadow-[0_0_0_3px_rgba(130,165,132,0.15)] focus:bg-black/40 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brew-accent/20 file:text-brew-lightest file:cursor-pointer hover:file:bg-brew-accent/30"
                            />
                            {imagePreview && (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs text-brew-pale/60">{formData.imageFile ? t("admin.form.imagePreviewNew") : t("admin.form.imagePreviewCurrent")}</p>
                                        {modalMode === 'edit' && selectedBeverage?.imageUrl && !formData.imageFile && (
                                            <button
                                                type="button"
                                                onClick={handleDeleteImage}
                                                className="px-3 py-1 bg-error-dark/20 border border-error-dark/30 rounded text-xs text-error-light hover:bg-error-dark/30 transition-all duration-200"
                                            >
                                                {t("admin.form.deleteImage")}
                                            </button>
                                        )}
                                    </div>
                                    <img src={imagePreview} alt="Preview" className="max-w-full h-auto max-h-[200px] rounded-lg border border-brew-accent/20" />
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="px-4 py-3 bg-error-dark/10 border border-error-dark/30 rounded-[10px] text-error-light text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 mt-2">
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={submitting}
                                className="flex-1 px-6 py-3 bg-black/40 border border-brew-accent/20 rounded-[10px] text-brew-lightest text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-black/60 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t("admin.form.cancel")}
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-6 py-3 bg-gradient-to-br from-[#2d6a4f] to-[#40916c] border-none rounded-[10px] text-white text-base font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(64,145,108,0.4)] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? t("admin.form.saving") : modalMode === 'add' ? t("admin.form.add") : t("admin.form.save")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="grid gap-5 pb-8">
            <section className="animate-[fadeIn_0.4s_ease-out] py-8 px-8 flex-1">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <h2 className="text-[1.75rem] font-bold m-0 bg-gradient-to-br from-brew-accent to-brew-lightest [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] bg-clip-text">
                            {t("admin.title")}
                        </h2>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="px-5 py-2.5 bg-gradient-to-br from-[#2d6a4f] to-[#40916c] border-none rounded-[10px] text-white text-sm font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(64,145,108,0.4)] active:scale-100"
                    >
                        + {t("admin.addButton")}
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-6 p-4 bg-gradient-to-br from-brew-dark/30 to-brew-mid/20 backdrop-blur-[10px] border border-brew-accent/20 rounded-[16px]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-brew-pale mb-1.5 uppercase tracking-wide">{t("admin.filters.search")}</label>
                            <input
                                type="search"
                                placeholder={t("admin.filters.searchPlaceholder")}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="w-full px-3.5 py-2 bg-black/30 border border-brew-accent/20 rounded-[10px] text-brew-lightest text-sm transition-all duration-200 focus:outline-none focus:border-brew-accent placeholder:text-brew-accent/50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-brew-pale mb-1.5 uppercase tracking-wide">{t("admin.filters.type")}</label>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full px-3.5 py-2 bg-black/30 border border-brew-accent/20 rounded-[10px] text-brew-lightest text-sm transition-all duration-200 focus:outline-none focus:border-brew-accent"
                            >
                                <option value="">{t("admin.filters.allTypes")}</option>
                                <option value="COFFEE">{t("types.COFFEE")}</option>
                                <option value="TEA">{t("types.TEA")}</option>
                                <option value="OTHER">{t("types.OTHER")}</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <div className="text-sm text-brew-pale">
                                {t("admin.filters.showing", { filtered: filteredAndSortedBeverages.length, total: beverages.length })}
                            </div>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="bg-brew-dark/20 border border-brew-accent/15 rounded-xl p-4 text-brew-lightest">
                        {t("admin.messages.loading")}
                    </div>
                )}

                {!loading && error && (
                    <div className="bg-error-dark/10 border border-error-dark/30 rounded-xl p-4 text-error-light">
                        {t("admin.messages.error", { message: error })}
                    </div>
                )}

                {!loading && !error && beverages.length === 0 && (
                    <div className="bg-brew-dark/20 border border-brew-accent/15 rounded-xl p-4 text-brew-lightest">
                        {t("admin.messages.empty")}
                    </div>
                )}

                {!loading && !error && beverages.length > 0 && (
                    <div className="bg-gradient-to-br from-brew-dark/30 to-brew-mid/20 backdrop-blur-[10px] border border-brew-accent/20 rounded-[16px] overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-brew-dark/40 border-b border-brew-accent/20">
                                    <th
                                        className="text-left px-5 py-3 text-sm font-semibold text-brew-lightest cursor-pointer hover:bg-brew-accent/10 transition-colors"
                                        onClick={() => handleSort('name')}
                                    >
                                        {t("admin.table.name")} {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        className="text-left px-5 py-3 text-sm font-semibold text-brew-lightest cursor-pointer hover:bg-brew-accent/10 transition-colors"
                                        onClick={() => handleSort('type')}
                                    >
                                        {t("admin.table.type")} {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        className="text-left px-5 py-3 text-sm font-semibold text-brew-lightest cursor-pointer hover:bg-brew-accent/10 transition-colors"
                                        onClick={() => handleSort('brand')}
                                    >
                                        {t("admin.table.brand")} {sortField === 'brand' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="text-left px-5 py-3 text-sm font-semibold text-brew-lightest">{t("admin.table.brewTime")}</th>
                                    <th className="text-right px-5 py-3 text-sm font-semibold text-brew-lightest">{t("admin.table.actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAndSortedBeverages.map((beverage, index) => (
                                    <tr
                                        key={beverage.id}
                                        className={`border-b border-brew-accent/10 hover:bg-brew-accent/5 transition-colors ${index % 2 === 0 ? 'bg-black/10' : ''}`}
                                    >
                                        <td className="px-5 py-3 text-brew-lightest">{beverage.name}</td>
                                        <td className="px-5 py-3">
                                            <span className="px-2 py-0.5 bg-brew-accent/20 border border-brew-accent/30 rounded text-xs text-brew-lightest">
                                                {beverage.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-brew-pale/80">{beverage.brand || '-'}</td>
                                        <td className="px-5 py-3 text-brew-pale/80 text-sm">
                                            {beverage.brewTimeMinSec || beverage.brewTimeMaxSec ? (
                                                <>
                                                    {beverage.brewTimeMinSec ? `${beverage.brewTimeMinSec}s` : ''}
                                                    {beverage.brewTimeMinSec && beverage.brewTimeMaxSec ? ' - ' : ''}
                                                    {beverage.brewTimeMaxSec ? `${beverage.brewTimeMaxSec}s` : ''}
                                                </>
                                            ) : '-'}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => openEditModal(beverage)}
                                                    className="px-3 py-1.5 bg-brew-accent/20 border border-brew-accent/30 rounded-[6px] text-brew-lightest text-xs font-medium cursor-pointer transition-all duration-200 hover:bg-brew-accent/30 hover:scale-105"
                                                >
                                                    {t("admin.actions.edit")}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(beverage)}
                                                    className="px-3 py-1.5 bg-error-dark/20 border border-error-dark/30 rounded-[6px] text-error-light text-xs font-medium cursor-pointer transition-all duration-200 hover:bg-error-dark/30 hover:scale-105"
                                                >
                                                    {t("admin.actions.delete")}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {renderModal()}
            </section>
        </div>
    );
}
