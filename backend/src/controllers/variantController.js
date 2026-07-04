import { Experiment } from "../models/Experiment.js";
import { Variant } from "../models/Variant.js";
import { BayesianState } from "../models/BayesianState.js";
import { getExperimentResults, recalculateProbabilities } from "../services/bayesianService.js";
import { ApiError, asyncHandler } from "../utils/errors.js";
import { sanitizeMarkup } from "../utils/security.js";

export const createVariant = asyncHandler(async (req, res) => {
  const { experimentId, name, htmlContent = "", cssContent = "" } = req.body;
  const experiment = await Experiment.findById(experimentId);

  if (!experiment) {
    throw new ApiError(404, "Experiment not found.");
  }

  const canEdit = req.user.role === "admin" || experiment.createdBy.toString() === req.user.id;
  if (!canEdit) {
    throw new ApiError(403, "You do not have access to edit this experiment.");
  }

  const variant = await Variant.create({
    experimentId,
    name,
    htmlContent: sanitizeMarkup(htmlContent),
    cssContent: sanitizeMarkup(cssContent)
  });

  await BayesianState.create({
    experimentId,
    variantId: variant.id,
    alpha: 1,
    beta: 1,
    probabilityBest: 0
  });

  experiment.variantIds.push(variant.id);
  experiment.variantCount = experiment.variantIds.length;
  await experiment.save();
  await recalculateProbabilities(experimentId);

  res.status(201).json({ variant });
});

export const listVariants = asyncHandler(async (req, res) => {
  const experiment = await Experiment.findById(req.params.experimentId);

  if (!experiment) {
    throw new ApiError(404, "Experiment not found.");
  }

  const canView = req.user.role === "admin" || experiment.createdBy.toString() === req.user.id;
  if (!canView) {
    throw new ApiError(403, "You do not have access to this experiment.");
  }

  const variants = await getExperimentResults(req.params.experimentId);
  res.json({ variants });
});
