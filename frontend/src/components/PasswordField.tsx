import { useState } from "react";

import { Button } from "./ui/Button";

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
}

export function PasswordField({ label, value, onChange, minLength }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label>
      {label}
      <div className="password-field">
        <input
          type={visible ? "text" : "password"}
          minLength={minLength}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <Button type="button" variant="ghost" size="sm" className="password-toggle" onClick={() => setVisible((current) => !current)}>
          {visible ? "Hide" : "Show"}
        </Button>
      </div>
    </label>
  );
}
