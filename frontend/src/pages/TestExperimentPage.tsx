import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { VariantPreview } from "../components/variants/VariantPreview";
import { api } from "../services/api";
import type { AllocationResponse, ExperimentMode, ServeVariantResponse } from "../types";

export function TestExperimentPage() {
  const { id = "" } = useParams();
  const [comparisonData, setComparisonData] = useState<AllocationResponse | null>(null);
  const [allocatorData, setAllocatorData] = useState<ServeVariantResponse | null>(null);
  const [mode, setMode] = useState<ExperimentMode | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSideBySide = async () => {
    const response = await api.getAllocation(id);
    setComparisonData(response);
    setAllocatorData(null);
    setMode(response.experiment?.mode ?? "side_by_side");
    await api.recordImpression({
      experimentId: id,
      variantIds: response.variants.map((variant) => variant._id)
    });
  };

  const loadAllocator = async () => {
    const response = await api.serveVariant(id);
    setAllocatorData(response);
    setComparisonData(null);
    setMode(response.experiment.mode);
    await api.recordImpression({
      experimentId: id,
      variantIds: [response.selectedVariant._id]
    });
  };

  const load = async () => {
    try {
      const experimentResponse = await api.getAllocation(id);
      const nextMode = experimentResponse.experiment?.mode ?? "side_by_side";

      setMode(nextMode);
      setError("");

      if (nextMode === "thompson_sampling") {
        await loadAllocator();
      } else {
        setComparisonData(experimentResponse);
        setAllocatorData(null);
        await api.recordImpression({
          experimentId: id,
          variantIds: experimentResponse.variants.map((variant) => variant._id)
        });
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load testing page.");
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const rankedLabel = useMemo(() => {
    if (mode === "thompson_sampling") {
      return (
        allocatorData?.rankedVariants
          .map((item) => `${item.variantName}: ${(item.probabilityBest * 100).toFixed(1)}%`)
          .join(" | ") ?? ""
      );
    }

    return (
      comparisonData?.allocation.rankedVariants
        .map((item) => `${item.variantName}: ${(item.probabilityBest * 100).toFixed(1)}%`)
        .join(" | ") ?? ""
    );
  }, [allocatorData, comparisonData, mode]);

  const handlePreferenceSelection = async (selectedVariantId: string) => {
    if (!comparisonData || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await api.recordClick({
        experimentId: id,
        selectedVariantId,
        shownVariantIds: comparisonData.variants.map((variant) => variant._id)
      });
      setMessage("Preference recorded. Bayesian posteriors updated.");
      setError("");
      await loadSideBySide();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to record selection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAllocatorOutcome = async (outcome: "success" | "failure") => {
    if (!allocatorData || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await api.recordOutcome({
        experimentId: id,
        variantId: allocatorData.selectedVariant._id,
        outcome
      });
      setMessage(
        outcome === "success"
          ? "Conversion recorded. Future traffic will lean harder toward strong performers."
          : "Non-conversion recorded. The allocator will rebalance on the next visitor."
      );
      setError("");
      await loadAllocator();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to record outcome.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mode) {
    return <div className="page">{error ? <p className="error-text">{error}</p> : <p>Loading test...</p>}</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">
            {mode === "thompson_sampling" ? "Bayesian Traffic Allocator" : "Preference Test"}
          </p>
          <h1>
            {mode === "thompson_sampling"
              ? "Serve one variant and learn from its conversion outcome"
              : "Choose the better experience"}
          </h1>
          <p>{rankedLabel}</p>
          <p>
            {mode === "thompson_sampling"
              ? "The backend samples from each posterior, serves the top draw, and updates only the shown variant."
              : "Clicks inside each rendered webpage are tracked as that variant's click signal."}
          </p>
        </div>
      </div>
      {message ? <p className="success-text">{message}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {mode === "thompson_sampling" && allocatorData ? (
        <Card className="test-surface">
          <div className="metric-grid">
            <div>
              <span className="metric-label">Currently served</span>
              <strong>{allocatorData.selectedVariant.name}</strong>
              <p>Chosen by Thompson Sampling</p>
            </div>
            <div>
              <span className="metric-label">Observed traffic</span>
              <strong>{allocatorData.selectedVariant.impressions}</strong>
              <p>{allocatorData.selectedVariant.clicks} clicks so far</p>
            </div>
          </div>
          <VariantPreview
            title={allocatorData.selectedVariant.name}
            htmlContent={allocatorData.selectedVariant.htmlContent}
            cssContent={allocatorData.selectedVariant.cssContent}
            frameClassName="variant-frame variant-frame-clickable"
            onVariantClick={() => void handleAllocatorOutcome("success")}
          />
          <div className="inline-actions">
            <Button type="button" onClick={() => void handleAllocatorOutcome("success")} disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Record conversion"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleAllocatorOutcome("failure")}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Recording..." : "Record no click"}
            </Button>
          </div>
        </Card>
      ) : null}

      {mode === "side_by_side" && comparisonData ? (
        <div className="comparison-grid">
          {comparisonData.variants.map((variant) => (
            <Card key={variant._id} className="test-surface">
              <VariantPreview
                title={variant.name}
                htmlContent={variant.htmlContent}
                cssContent={variant.cssContent}
                frameClassName="variant-frame variant-frame-clickable"
                onVariantClick={() => void handlePreferenceSelection(variant._id)}
              />
              <Button
                type="button"
                onClick={() => void handlePreferenceSelection(variant._id)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Recording..." : `Select ${variant.name}`}
              </Button>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
