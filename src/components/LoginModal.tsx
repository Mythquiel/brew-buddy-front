import React, {useEffect, useRef, useState} from "react";
import { createPortal } from "react-dom";
import styles from "../style/modal.module.css";
import { useTranslation } from "react-i18next";

export type LoginCredentials = {
  username: string;
  password: string;
};

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (creds: LoginCredentials) => Promise<void> | void;
};

export default function LoginModal({ isOpen, onClose, onSubmit }: LoginModalProps) {
  const { t } = useTranslation("home");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const usernameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const id = window.setTimeout(() => usernameRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    setUsername("");
    setPassword("");
    setShowPassword(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const handleBackdropClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    try {
      setSubmitting(true);
      await onSubmit?.({ username, password });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalDialog} role="dialog" aria-modal="true" aria-labelledby="login-title" aria-describedby="login-desc">
        <div className={styles.modalHeader}>
          <h2 id="login-title">{t("login.title", "Login")}</h2>
          <button type="button" className={`${styles.iconButton} ${styles.close}`} aria-label={t("login.close", "Close")} onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <label className={styles.formLabel}>
            {t("login.username", "Username")}
            <input
              ref={usernameRef}
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label className={styles.formLabel}>
            {t("login.password", "Password")}
            <div className={styles.passwordField}>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={`${styles.iconButton} ${styles.toggle}`}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t("login.hidePassword", "Hide password") : t("login.showPassword", "Show password")}
              >
                {showPassword ? "◎" : "◉"}
              </button>
            </div>
          </label>

          <div className={styles.modalActions}>
            <button type="button" className={styles.secondary} onClick={onClose} disabled={submitting}>
              {t("login.cancel", "Cancel")}
            </button>
            <button type="submit" className={styles.primary} disabled={submitting}>
              {submitting ? t("login.submitting", "Signing in…") : t("login.submit", "Sign in")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
