import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { PasswordField } from "../components/PasswordField";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form);
      navigate("/experiments");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card" as="form" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Bayesian A/B Testing</p>
          <h1>Sign in</h1>
          <p>Use your account to manage experiments and review Bayesian performance.</p>
        </div>
        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </label>
        <PasswordField
          label="Password"
          value={form.password}
          onChange={(value) => setForm((current) => ({ ...current, password: value }))}
        />
        {error ? <p className="error-text">{error}</p> : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </Button>
        <p className="auth-switch">
          Need an account? <Link to="/register">Register</Link>
        </p>
        <p className="auth-switch">
          Back to <Link to="/">home</Link>
        </p>
      </Card>
    </div>
  );
}
