import React, {useEffect, useRef, useState} from "react";
import { createPortal } from "react-dom";
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
    <div className="fixed inset-0 bg-black/55 flex items-center justify-center p-4 z-[2000]" onClick={handleBackdropClick}>
      <div className="w-full max-w-[420px] bg-[var(--color-bg-darker)] text-[var(--color-neutral-warm)] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] border border-white/8" role="dialog" aria-modal="true" aria-labelledby="login-title" aria-describedby="login-desc">
        <div className="flex items-center justify-between p-4 pb-1">
          <h2 id="login-title">{t("login.title", "Login")}</h2>
          <button
            type="button"
            className="bg-transparent border-none px-2 py-1 text-[var(--color-neutral-warm)] cursor-pointer text-xl leading-none rounded-lg"
            aria-label={t("login.close", "Close")}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <p className="mx-4 mb-2 opacity-85 text-[0.95rem]" id="login-desc"></p>
        <form onSubmit={handleSubmit} className="p-2 px-4 pb-4 grid gap-3">
          <label className="grid gap-[0.35rem] text-[0.95rem]">
            {t("login.username", "Username")}
            <input
              ref={usernameRef}
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-white/12 bg-black/25 text-[var(--color-neutral-warm)]"
            />
          </label>
          <label className="grid gap-[0.35rem] text-[0.95rem]">
            {t("login.password", "Password")}
            <div className="relative flex">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="flex-1 px-3 py-2 pr-10 rounded-lg border border-white/12 bg-black/25 text-[var(--color-neutral-warm)]"
              />
              <button
                type="button"
                className="absolute right-[4px] top-1/2 -translate-y-1/2 bg-transparent border-none px-2 py-1 text-[var(--color-neutral-warm)] cursor-pointer rounded-md"
                aria-pressed={showPassword}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t("login.hidePassword", "Hide password") : t("login.showPassword", "Show password")}
              >
                {showPassword ? "◎" : "◉"}
              </button>
            </div>
          </label>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              className="bg-white/6 text-[var(--color-neutral-warm)] border border-white/12 px-4 py-2 rounded-lg"
              onClick={onClose}
              disabled={submitting}
            >
              {t("login.cancel", "Cancel")}
            </button>
            <button
              type="submit"
              className="bg-brew-dark/90 text-brew-accent border-none px-4 py-2 rounded-lg disabled:opacity-70"
              disabled={submitting}
            >
              {submitting ? t("login.submitting", "Signing in…") : t("login.submit", "Sign in")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
