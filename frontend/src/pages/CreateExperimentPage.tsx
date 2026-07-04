import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { VariantEditor, type EditableVariant } from "../components/variants/VariantEditor";
import { api } from "../services/api";
import type { ExperimentMode } from "../types";

const createEmptyVariant = (index: number): EditableVariant => ({
  name: `Variant ${String.fromCharCode(65 + index)}`,
  htmlContent: `<section class="hero"><h1>Variant ${String.fromCharCode(65 + index)}</h1><p>Describe the experience here.</p><button>Click here</button></section>`,
  cssContent: ".hero { padding: 32px; text-align: center; background: #f8fafc; } button { background: #111827; color: white; border: none; padding: 10px 16px; border-radius: 8px; }"
});

export function CreateExperimentPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");
  const [mode, setMode] = useState<ExperimentMode>("side_by_side");
  const [variantCount, setVariantCount] = useState(2);
  const [variants, setVariants] = useState<EditableVariant[]>([createEmptyVariant(0), createEmptyVariant(1)]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVariantCountChange = (value: number) => {
    const nextCount = Math.max(2, Math.min(6, value));
    setVariantCount(nextCount);
    setVariants((current) =>
      Array.from({ length: nextCount }, (_, index) => current[index] ?? createEmptyVariant(index))
    );
  };

  const handleVariantChange = (index: number, field: keyof EditableVariant, value: string) => {
    setVariants((current) =>
      current.map((variant, currentIndex) =>
        currentIndex === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.createExperiment({
        title,
        description,
        status,
        mode,
        variants
      });

      navigate(`/experiments/${response.experiment._id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create experiment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="page" onSubmit={handleSubmit}>
      <div className="page-header">
        <div>
          <p className="eyebrow">Experiment Setup</p>
          <h1>Create experiment</h1>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create experiment"}
        </Button>
      </div>
      <Card className="form-card">
        <div className="form-grid">
          <label>
            Experiment name
            <input required value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            Initial status
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="draft">Draft</option>
              <option value="running">Running</option>
              <option value="paused">Paused</option>
            </select>
          </label>
          <label>
            Allocation mode
            <select value={mode} onChange={(event) => setMode(event.target.value as ExperimentMode)}>
              <option value="side_by_side">Side-by-side preference test</option>
              <option value="thompson_sampling">True Bayesian traffic allocator</option>
            </select>
          </label>
          <label className="full-width">
            Description
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
          </label>
          <label>
            Number of variants
            <input
              type="number"
              min={2}
              max={6}
              value={variantCount}
              onChange={(event) => handleVariantCountChange(Number(event.target.value))}
            />
          </label>
        </div>
      </Card>
      {error ? <p className="error-text">{error}</p> : null}
      <div className="stack">
        {variants.map((variant, index) => (
          <VariantEditor
            key={`${variant.name}-${index}`}
            index={index}
            variant={variant}
            onChange={handleVariantChange}
          />
        ))}
      </div>
    </form>
  );
}
