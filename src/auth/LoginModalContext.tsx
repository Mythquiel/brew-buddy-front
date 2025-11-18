import React, {createContext, useCallback, useContext, useMemo, useState} from "react";
import LoginModal, {type LoginCredentials } from "../components/LoginModal";
import { useNavigate } from "react-router-dom";

export type LoginModalContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setOnSubmit: (handler: (creds: LoginCredentials) => Promise<void> | void) => void;
};

const LoginModalContext = createContext<LoginModalContextValue | undefined>(undefined);

export function LoginModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitHandler, setSubmitHandler] = useState<((c: LoginCredentials) => Promise<void> | void) | null>(null);
  const navigate = useNavigate();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const handleSubmit = useCallback(async (creds: LoginCredentials) => {
    if (submitHandler) {
      await submitHandler(creds);
      return;
    }
    // Default, simple demo handler. Replace with real auth when available.
    const { username, password } = creds;
    if (username === "admin" && password === "admin") {
      navigate("/admin");
    } else {
      alert("Invalid credentials");
    }
  }, [navigate, submitHandler]);

  const value = useMemo<LoginModalContextValue>(() => ({
    isOpen,
    open,
    close,
    setOnSubmit: setSubmitHandler,
  }), [isOpen, open, close]);

  return (
    <LoginModalContext.Provider value={value}>
      {children}
      <LoginModal isOpen={isOpen} onClose={close} onSubmit={handleSubmit} />
    </LoginModalContext.Provider>
  );
}

export function useLoginModal() {
  const ctx = useContext(LoginModalContext);
  if (!ctx) throw new Error("useLoginModal must be used within LoginModalProvider");
  return ctx;
}
