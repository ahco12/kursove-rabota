import React, { useState } from "react";
import { useAuth } from "../auth";

export default function AuthPage() {
  const { register, login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isRegister ? "Регистрация" : "Вход"}</h2>

      <form onSubmit={submit} className="auth-form">
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>

        <label>
          Парола
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" disabled={loading}>
          {isRegister ? "Създай акаунт" : "Влез"}
        </button>
      </form>

      <p className="auth-toggle">
        {isRegister ? "Вече имате акаунт?" : "Нямате акаунт?"}{" "}
        <button onClick={() => setIsRegister((s) => !s)} className="link-btn">
          {isRegister ? "Влез" : "Регистрирай се"}
        </button>
      </p>
    </div>
  );
}
