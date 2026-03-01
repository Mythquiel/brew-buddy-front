import { useState, useEffect } from "react";
import styles from "../style/support.module.css";
import { useTranslation } from "react-i18next";

type SupportOption = 'feature' | 'bug' | 'question' | null;

export default function Support() {
    const { t } = useTranslation("support");
    const [selectedOption, setSelectedOption] = useState<SupportOption>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [submitted, setSubmitted] = useState(false);

    // Close modal on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && selectedOption) {
                closeModal();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [selectedOption]);

    // Prevent body scroll when modal is open
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
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Connect to backend API
        console.log("Form submitted:", { type: selectedOption, ...formData });
        setSubmitted(true);
        setTimeout(() => {
            closeModal();
        }, 2500);
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
            <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
                <div className={styles.modal}>
                    <button
                        className={styles.closeButton}
                        onClick={closeModal}
                        aria-label="Close"
                    >
                        ✕
                    </button>

                    <h3 className={styles.modalTitle}>{titles[selectedOption]}</h3>

                    {submitted ? (
                        <div className={styles.successMessage}>
                            <div className={styles.successIcon}>✓</div>
                            <h4>{t("forms.success.title")}</h4>
                            <p>{t("forms.success.message")}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name">{t("forms.fields.name")}</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="email">{t("forms.fields.email")}</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="subject">{t("forms.fields.subject")}</label>
                                <input
                                    type="text"
                                    id="subject"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="message">{t("forms.fields.message")}</label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder={placeholders[selectedOption]}
                                    required
                                />
                            </div>

                            <button type="submit" className={styles.submitButton}>
                                {t("forms.submit")}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    };

    return (
        <section className={styles.supportPage}>
            <div className={styles.header}>
                <h2>{t("title")}</h2>
                <p className={styles.subtitle}>{t("subtitle")}</p>
            </div>

            <div className={styles.optionsGrid}>
                <button
                    className={styles.optionCard}
                    onClick={() => setSelectedOption('feature')}
                >
                    <div className={styles.iconWrapper}>
                        <span className={styles.icon}>💡</span>
                    </div>
                    <h3>{t("options.feature.title")}</h3>
                    <p>{t("options.feature.description")}</p>
                    <span className={styles.arrow}>→</span>
                </button>

                <button
                    className={styles.optionCard}
                    onClick={() => setSelectedOption('bug')}
                >
                    <div className={styles.iconWrapper}>
                        <span className={styles.icon}>🐛</span>
                    </div>
                    <h3>{t("options.bug.title")}</h3>
                    <p>{t("options.bug.description")}</p>
                    <span className={styles.arrow}>→</span>
                </button>

                <button
                    className={styles.optionCard}
                    onClick={() => setSelectedOption('question')}
                >
                    <div className={styles.iconWrapper}>
                        <span className={styles.icon}>❓</span>
                    </div>
                    <h3>{t("options.question.title")}</h3>
                    <p>{t("options.question.description")}</p>
                    <span className={styles.arrow}>→</span>
                </button>
            </div>

            {renderModal()}
        </section>
    );
}