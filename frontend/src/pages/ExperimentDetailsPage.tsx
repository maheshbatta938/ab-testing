import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Button, ButtonLink } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { VariantPreview } from "../components/variants/VariantPreview";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import type { ExperimentDetailsResponse, ExperimentMode } from "../types";

export function ExperimentDetailsPage() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState<ExperimentDetailsResponse | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("running");
  const [mode, setMode] = useState<ExperimentMode>("side_by_side");
  const [variantForm, setVariantForm] = useState({
    name: "",
    htmlContent: "<section><h2>New variant</h2><p>Add your message.</p></section>",
    cssContent: "section { padding: 24px; background: #f3f4f6; }"
  });
  const publicTestUrl = typeof window !== "undefined" ? `${window.location.origin}/test/${id}` : `/test/${id}`;

  const load = async () => {
    try {
      const response = await api.getExperiment(id);
      setData(response);
      setStatus(response.experiment.status);
      setMode(response.experiment.mode);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load experiment.");
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const handleAddVariant = async (event: FormEvent) => {
    event.preventDefault();

    try {
      await api.createVariant({
        experimentId: id,
        ...variantForm
      });
      setVariantForm({
        name: "",
        htmlContent: "<section><h2>New variant</h2><p>Add your message.</p></section>",
        cssContent: "section { padding: 24px; background: #f3f4f6; }"
      });
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to add variant.");
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await api.updateExperimentStatus(id, { status, mode });
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to update status.");
    }
  };

  if (!data) {
    return <div className="page">{error ? <p className="error-text">{error}</p> : <p>Loading...</p>}</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Experiment Results</p>
          <h1>{data.experiment.title}</h1>
          <p>{data.experiment.description}</p>
          <p>
            Mode:{" "}
            <strong>
              {data.experiment.mode === "thompson_sampling"
                ? "True Bayesian traffic allocator"
                : "Side-by-side preference test"}
            </strong>
          </p>
          <p>Share this tester link with a separate participant: {publicTestUrl}</p>
        </div>
        <div className="inline-actions">
          <ButtonLink to={`/test/${data.experiment._id}`}>
            {data.experiment.mode === "thompson_sampling" ? "Open allocator page" : "Open testing page"}
          </ButtonLink>
          {user?.role === "admin" ? (
            <>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="draft">Draft</option>
                <option value="running">Running</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
              <select value={mode} onChange={(event) => setMode(event.target.value as ExperimentMode)}>
                <option value="side_by_side">Side-by-side preference test</option>
                <option value="thompson_sampling">True Bayesian traffic allocator</option>
              </select>
              <Button type="button" onClick={handleStatusUpdate}>
                Save settings
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <section className="results-grid">
        {data.variants.map((variant) => (
          <Card key={variant._id}>
            <div className="metric-grid">
              <div>
                <span className="metric-label">{variant.name}</span>
                <strong>{(variant.probabilityBest * 100).toFixed(1)}%</strong>
                <p>Probability best</p>
              </div>
              <div>
                <span className="metric-label">Clicks</span>
                <strong>{variant.clicks}</strong>
                <p>{variant.impressions} impressions</p>
              </div>
              <div>
                <span className="metric-label">Conversion rate</span>
                <strong>{(variant.conversionRate * 100).toFixed(1)}%</strong>
                <p>
                  Beta({variant.alpha}, {variant.beta})
                </p>
              </div>
            </div>
            <VariantPreview
              title={variant.name}
              htmlContent={variant.htmlContent}
              cssContent={variant.cssContent}
            />
          </Card>
        ))}
      </section>

      <Card className="form-card">
        <h2>Add variant</h2>
        <form className="stack" onSubmit={handleAddVariant}>
          <label>
            Variant name
            <input
              value={variantForm.name}
              onChange={(event) => setVariantForm((current) => ({ ...current, name: event.target.value }))}
            />
          </label>
          <label>
            HTML
            <textarea
              rows={6}
              value={variantForm.htmlContent}
              onChange={(event) =>
                setVariantForm((current) => ({ ...current, htmlContent: event.target.value }))
              }
            />
          </label>
          <label>
            CSS
            <textarea
              rows={6}
              value={variantForm.cssContent}
              onChange={(event) =>
                setVariantForm((current) => ({ ...current, cssContent: event.target.value }))
              }
            />
          </label>
          <Button type="submit">Add variant</Button>
        </form>
      </Card>
    </div>
  );
}
