import { useEffect, useState } from "react";

import { Badge } from "../components/ui/Badge";
import { ButtonLink } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { api } from "../services/api";
import type { Experiment, VariantResult } from "../types";

type AdminExperiment = Experiment & { variants: VariantResult[] };

export function AdminDashboardPage() {
  const [experiments, setExperiments] = useState<AdminExperiment[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getAdminExperiments()
      .then((response) => setExperiments(response.experiments))
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : "Failed to load admin dashboard.")
      );
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Experiment monitoring</h1>
        </div>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      <div className="stack">
        {experiments.map((experiment) => (
          <Card key={experiment._id}>
            <div className="status-row">
              <div>
                <h2>{experiment.title}</h2>
                <p>
                  Owner: {experiment.createdBy.name} ({experiment.createdBy.email})
                </p>
                <p>
                  Mode:{" "}
                  {experiment.mode === "thompson_sampling" ? "True Bayesian traffic allocator" : "Side-by-side preference test"}
                </p>
              </div>
              <Badge
                tone={
                  experiment.status === "running"
                    ? "success"
                    : experiment.status === "paused"
                      ? "warning"
                      : "muted"
                }
              >
                {experiment.status}
              </Badge>
            </div>
            <div className="admin-metrics">
              {experiment.variants.map((variant) => (
                <div className="metric-tile" key={variant._id}>
                  <strong>{variant.name}</strong>
                  <span>Clicks: {variant.clicks}</span>
                  <span>Impressions: {variant.impressions}</span>
                  <span>Prob. best: {(variant.probabilityBest * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
            <ButtonLink to={`/experiments/${experiment._id}`} variant="ghost" size="sm">
              Inspect experiment
            </ButtonLink>
          </Card>
        ))}
      </div>
    </div>
  );
}
