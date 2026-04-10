import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

type SupportOption = 'feature' | 'bug' | 'question' | null;

function useApiBaseUrl() {
    return useMemo(() => {
        const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;
        if (fromEnv && fromEnv.trim().length > 0) {
            return fromEnv.replace(/\/$/, "");
        }
        return "";
    }, []);
}

export default function Support() {
    const { t } = useTranslation("support");
    const baseUrl = useApiBaseUrl();
    const [selectedOption, setSelectedOption] = useState<SupportOption>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && selectedOption) {
                closeModal();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [selectedOption]);

    useEffect(() => {
        if (selectedOption) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedOption]);

    const closeModal = () => {
        setSelectedOption(null);
        setSubmitted(false);
        setError(null);
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${baseUrl}/api/v1/support`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            setSubmitted(true);
            setTimeout(() => {
                closeModal();
            }, 2500);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setSubmitting(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    const renderModal = () => {
        if (!selectedOption) return null;

        const titles = {
            feature: t("forms.feature.title"),
            bug: t("forms.bug.title"),
            question: t("forms.question.title")
        };

        const placeholders = {
            feature: t("forms.feature.placeholder"),
            bug: t("forms.bug.placeholder"),
            question: t("forms.question.placeholder")
        };

        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[1001] p-4 animate-[fadeInBackdrop_0.3s_ease-out]" onClick={handleBackdropClick}>
                <div className="relative bg-gradient-to-br from-[#0f2018] to-[#081610] border border-brew-accent/20 rounded-[20px] px-8 py-7 max-w-[550px] w-full max-h-[85vh] overflow-y-auto shadow-[0_8px_32px_rgba(0,0,0,0.4),0_16px_64px_rgba(0,0,0,0.3)] animate-[slideUp_0.3s_ease-out] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-black/20 [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-brew-accent/30 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-brew-accent/50">
                    <button
                        className="absolute top-[20px] right-[20px] bg-brew-accent/15 border-none text-brew-lightest w-9 h-9 rounded-full text-xl cursor-pointer flex items-center justify-center transition-all duration-200 z-10 hover:bg-brew-accent/25 hover:scale-110"
                        onClick={closeModal}
                        aria-label="Close"
                    >
                        ✕
                    </button>

                    <h3 className="text-2xl font-semibold text-brew-lightest m-0 mb-5 pr-10">{titles[selectedOption]}</h3>

                    {submitted ? (
                        <div className="p-8 px-6 text-center animate-[scaleIn_0.4s_ease-out]">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#16a34a] to-[#22c55e] rounded-full flex items-center justify-center text-[2.5rem] text-white shadow-[0_4px_16px_rgba(34,197,94,0.4)] animate-[bounce_0.6s_ease-out]">✓</div>
                            <h4 className="text-[1.375rem] font-semibold text-brew-lightest m-0 mb-3">{t("forms.success.title")}</h4>
                            <p className="text-[0.9375rem] text-brew-pale m-0 leading-relaxed">{t("forms.success.message")}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {error && (
                                <div className="px-4 py-3 bg-error-dark/10 border border-error-dark/30 rounded-[10px] text-error-light text-sm">
                                    {t("forms.error")}: {error}
                                </div>
                            )}

                            <div className="mb-0">
                                <label htmlFor="name" className="block text-[0.8125rem] font-medium text-brew-pale mb-1.5 uppercase tracking-wide">{t("forms.fields.name")}</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-black/30 border border-brew-accent/20 rounded-[10px] text-brew-lightest text-[0.9375rem] transition-all duration-200 focus:outline-none focus:border-brew-accent focus:shadow-[0_0_0_3px_rgba(130,165,132,0.15)] focus:bg-black/40 placeholder:text-brew-accent/50"
                                />
                            </div>

                            <div className="mb-0">
                                <label htmlFor="email" className="block text-[0.8125rem] font-medium text-brew-pale mb-1.5 uppercase tracking-wide">{t("forms.fields.email")}</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-black/30 border border-brew-accent/20 rounded-[10px] text-brew-lightest text-[0.9375rem] transition-all duration-200 focus:outline-none focus:border-brew-accent focus:shadow-[0_0_0_3px_rgba(130,165,132,0.15)] focus:bg-black/40 placeholder:text-brew-accent/50"
                                />
                            </div>

                            <div className="mb-0">
                                <label htmlFor="subject" className="block text-[0.8125rem] font-medium text-brew-pale mb-1.5 uppercase tracking-wide">{t("forms.fields.subject")}</label>
                                <input
                                    type="text"
                                    id="subject"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-black/30 border border-brew-accent/20 rounded-[10px] text-brew-lightest text-[0.9375rem] transition-all duration-200 focus:outline-none focus:border-brew-accent focus:shadow-[0_0_0_3px_rgba(130,165,132,0.15)] focus:bg-black/40 placeholder:text-brew-accent/50"
                                />
                            </div>

                            <div className="mb-0">
                                <label htmlFor="message" className="block text-[0.8125rem] font-medium text-brew-pale mb-1.5 uppercase tracking-wide">{t("forms.fields.message")}</label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder={placeholders[selectedOption]}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-black/30 border border-brew-accent/20 rounded-[10px] text-brew-lightest text-[0.9375rem] transition-all duration-200 resize-y min-h-[90px] focus:outline-none focus:border-brew-accent focus:shadow-[0_0_0_3px_rgba(130,165,132,0.15)] focus:bg-black/40 placeholder:text-brew-accent/50"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full px-6 py-3 bg-gradient-to-br from-[#2d6a4f] to-[#40916c] border-none rounded-[10px] text-white text-base font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.2)] mt-2 hover:not(:disabled):scale-[1.02] hover:not(:disabled):shadow-[0_6px_20px_rgba(64,145,108,0.4)] active:not(:disabled):scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? t("forms.submitting") : t("forms.submit")}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    };

    return (
        <section className="animate-[fadeIn_0.4s_ease-out] py-8 md:py-6">
            <div className="text-center mb-12">
                <h2 className="text-[2.5rem] font-bold m-0 mb-4 bg-gradient-to-br from-brew-accent to-brew-lightest [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] bg-clip-text md:text-[2rem]">{t("title")}</h2>
                <p className="text-lg text-brew-accent/80 m-0 leading-relaxed">{t("subtitle")}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-3 md:gap-4">
                <button
                    className="relative bg-gradient-to-br from-brew-dark/30 to-brew-mid/20 backdrop-blur-[10px] border border-brew-accent/20 rounded-[16px] p-5 text-center cursor-pointer transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.1)] overflow-hidden hover:scale-[1.02] hover:border-brew-accent/40 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2),0_16px_48px_rgba(27,67,50,0.3)] hover:from-brew-dark/40 hover:to-brew-mid/30 active:scale-[0.98]"
                    onClick={() => setSelectedOption('feature')}
                >
                    <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-transform duration-300">
                        <span className="text-[1.75rem] leading-none">💡</span>
                    </div>
                    <h3 className="text-lg font-semibold text-brew-lightest m-0 mb-2">{t("options.feature.title")}</h3>
                    <p className="text-xs text-brew-pale/80 leading-relaxed m-0 mb-3">{t("options.feature.description")}</p>
                    <span className="inline-block text-lg text-brew-accent transition-transform duration-300">→</span>
                </button>

                <button
                    className="relative bg-gradient-to-br from-brew-dark/30 to-brew-mid/20 backdrop-blur-[10px] border border-brew-accent/20 rounded-[16px] p-5 text-center cursor-pointer transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.1)] overflow-hidden hover:scale-[1.02] hover:border-brew-accent/40 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2),0_16px_48px_rgba(27,67,50,0.3)] hover:from-brew-dark/40 hover:to-brew-mid/30 active:scale-[0.98]"
                    onClick={() => setSelectedOption('bug')}
                >
                    <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-transform duration-300">
                        <span className="text-[1.75rem] leading-none">🐛</span>
                    </div>
                    <h3 className="text-lg font-semibold text-brew-lightest m-0 mb-2">{t("options.bug.title")}</h3>
                    <p className="text-xs text-brew-pale/80 leading-relaxed m-0 mb-3">{t("options.bug.description")}</p>
                    <span className="inline-block text-lg text-brew-accent transition-transform duration-300">→</span>
                </button>

                <button
                    className="relative bg-gradient-to-br from-brew-dark/30 to-brew-mid/20 backdrop-blur-[10px] border border-brew-accent/20 rounded-[16px] p-5 text-center cursor-pointer transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.1)] overflow-hidden hover:scale-[1.02] hover:border-brew-accent/40 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2),0_16px_48px_rgba(27,67,50,0.3)] hover:from-brew-dark/40 hover:to-brew-mid/30 active:scale-[0.98]"
                    onClick={() => setSelectedOption('question')}
                >
                    <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-transform duration-300">
                        <span className="text-[1.75rem] leading-none">❓</span>
                    </div>
                    <h3 className="text-lg font-semibold text-brew-lightest m-0 mb-2">{t("options.question.title")}</h3>
                    <p className="text-xs text-brew-pale/80 leading-relaxed m-0 mb-3">{t("options.question.description")}</p>
                    <span className="inline-block text-lg text-brew-accent transition-transform duration-300">→</span>
                </button>
            </div>

            {renderModal()}
        </section>
    );
}