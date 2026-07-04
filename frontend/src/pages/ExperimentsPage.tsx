import { useEffect, useState } from "react";

import { Badge } from "../components/ui/Badge";
import { ButtonLink } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { api } from "../services/api";
import type { Experiment } from "../types";

export function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getExperiments()
      .then((response) => setExperiments(response.experiments))
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : "Unable to load experiments.")
      );
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Your experiments</h1>
        </div>
        <ButtonLink to="/experiments/new">
          New experiment
        </ButtonLink>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      <div className="grid">
        {experiments.map((experiment) => (
          <Card key={experiment._id} className="workspace-card">
            <div className="status-row">
              <strong>{experiment.title}</strong>
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
            <p>{experiment.description || "No description provided."}</p>
            <div className="meta-row">
              <span>{experiment.variantCount} variants</span>
              <span>
                {experiment.mode === "thompson_sampling" ? "Adaptive allocator" : "Preference test"}
              </span>
              <span>{new Date(experiment.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="card-actions">
              <ButtonLink to={`/experiments/${experiment._id}`} variant="ghost" size="sm">
                View results
              </ButtonLink>
              <ButtonLink to={`/test/${experiment._id}`} size="sm">
                {experiment.mode === "thompson_sampling" ? "Run allocator" : "Run test"}
              </ButtonLink>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
