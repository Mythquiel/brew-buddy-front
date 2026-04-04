import React, {createContext, useCallback, useContext, useMemo, useState} from "react";
import LoginModal, {type LoginCredentials, type RegisterCredentials } from "../components/LoginModal";
import { useAuth } from "./AuthContext";

export type LoginModalContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const LoginModalContext = createContext<LoginModalContextValue | undefined>(undefined);

export function LoginModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { login, register } = useAuth();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const handleLogin = useCallback(async (creds: LoginCredentials) => {
    await login(creds);
  }, [login]);

  const handleRegister = useCallback(async (creds: RegisterCredentials) => {
    await register(creds);
  }, [register]);

  const value = useMemo<LoginModalContextValue>(() => ({
    isOpen,
    open,
    close,
  }), [isOpen, open, close]);

  return (
    <LoginModalContext.Provider value={value}>
      {children}
      <LoginModal isOpen={isOpen} onClose={close} onLogin={handleLogin} onRegister={handleRegister} />
    </LoginModalContext.Provider>
  );
}

export function useLoginModal() {
  const ctx = useContext(LoginModalContext);
  if (!ctx) throw new Error("useLoginModal must be used within LoginModalProvider");
  return ctx;
}
