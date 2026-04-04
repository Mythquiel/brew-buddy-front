import React, {useEffect, useRef, useState} from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export type LoginCredentials = {
  username: string;
  password: string;
};

export type RegisterCredentials = {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (creds: LoginCredentials) => Promise<void> | void;
  onRegister?: (creds: RegisterCredentials) => Promise<void> | void;
};

export default function LoginModal({ isOpen, onClose, onLogin, onRegister }: LoginModalProps) {
  const { t } = useTranslation("home");
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      const id = window.setTimeout(() => usernameRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    setMode('login');
    setUsername("");
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setShowPassword(false);
    setError(null);
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
    setError(null);

    if (mode === 'login') {
      if (!username || !password) return;
      try {
        setSubmitting(true);
        await onLogin?.({ username, password });
        if (location.pathname === '/') {
          navigate("/drinks");
        }
       onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed');
      } finally {
        setSubmitting(false);
      }
    } else {
      if (!username || !email || !password) return;
      try {
        setSubmitting(true);
        await onRegister?.({ username, email, password, firstName, lastName });
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/55 flex items-center justify-center p-4 z-[2000]" onClick={handleBackdropClick}>
      <div className="w-full max-w-[420px] bg-[var(--color-bg-darker)] text-[var(--color-neutral-warm)] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] border border-white/8" role="dialog" aria-modal="true" aria-labelledby="login-title" aria-describedby="login-desc">
        <div className="flex items-center justify-between p-4 pb-1">
          <h2 id="login-title">{mode === 'login' ? t("login.title", "Login") : t("register.title", "Register")}</h2>
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
        {error && (
          <div className="mx-4 mb-2 px-3 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}
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

          {mode === 'register' && (
            <>
              <label className="grid gap-[0.35rem] text-[0.95rem]">
                {t("register.email", "Email")}
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-white/12 bg-black/25 text-[var(--color-neutral-warm)]"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-[0.35rem] text-[0.95rem]">
                  {t("register.firstName", "First Name")}
                  <input
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-white/12 bg-black/25 text-[var(--color-neutral-warm)]"
                  />
                </label>
                <label className="grid gap-[0.35rem] text-[0.95rem]">
                  {t("register.lastName", "Last Name")}
                  <input
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-white/12 bg-black/25 text-[var(--color-neutral-warm)]"
                  />
                </label>
              </div>
            </>
          )}

          <label className="grid gap-[0.35rem] text-[0.95rem]">
            {t("login.password", "Password")}
            <div className="relative flex">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete={mode === 'register' ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={5}
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

          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-end gap-2">
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
                {submitting
                  ? (mode === 'login' ? t("login.submitting", "Signing in…") : t("register.submitting", "Creating account…"))
                  : (mode === 'login' ? t("login.submit", "Sign in") : t("register.submit", "Create account"))
                }
              </button>
            </div>
            <div className="text-center text-sm opacity-75">
              {mode === 'login' ? (
                <button
                  type="button"
                  className="bg-transparent border-none text-[var(--color-neutral-warm)] cursor-pointer underline"
                  onClick={() => { setMode('register'); setError(null); }}
                  disabled={submitting}
                >
                  {t("login.switchToRegister", "Don't have an account? Register")}
                </button>
              ) : (
                <button
                  type="button"
                  className="bg-transparent border-none text-[var(--color-neutral-warm)] cursor-pointer underline"
                  onClick={() => { setMode('login'); setError(null); }}
                  disabled={submitting}
                >
                  {t("register.switchToLogin", "Already have an account? Login")}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
