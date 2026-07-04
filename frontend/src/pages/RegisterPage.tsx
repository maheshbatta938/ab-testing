import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { PasswordField } from "../components/PasswordField";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(form);
      navigate("/experiments");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card" as="form" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Launch an experiment</p>
          <h1>Create account</h1>
          <p>Create a user account to build experiments and review Bayesian results.</p>
        </div>
        <label>
          Full name
          <input
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </label>
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
          minLength={6}
          onChange={(value) => setForm((current) => ({ ...current, password: value }))}
        />
        {error ? <p className="error-text">{error}</p> : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </Button>
        <p className="auth-switch">
          Already registered? <Link to="/login">Login</Link>
        </p>
        <p className="auth-switch">
          Back to <Link to="/">home</Link>
        </p>
      </Card>
    </div>
  );
}
