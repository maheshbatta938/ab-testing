import { Experiment } from "../models/Experiment.js";
import { Variant } from "../models/Variant.js";
import { recordBinaryOutcome, recordPosteriorUpdate } from "../services/bayesianService.js";
import { ApiError, asyncHandler } from "../utils/errors.js";

export const recordImpression = asyncHandler(async (req, res) => {
  const { experimentId, variantIds = [] } = req.body;
  const experiment = await Experiment.findById(experimentId);

  if (!experiment) {
    throw new ApiError(404, "Experiment not found.");
  }

  const idsToUpdate = variantIds.length > 0 ? variantIds : experiment.variantIds;
  await Variant.updateMany({ _id: { $in: idsToUpdate } }, { $inc: { impressions: 1 } });

  res.status(201).json({ message: "Impressions recorded." });
});

export const recordClick = asyncHandler(async (req, res) => {
  const { experimentId, selectedVariantId, shownVariantIds = [] } = req.body;
  const experiment = await Experiment.findById(experimentId);

  if (!experiment) {
    throw new ApiError(404, "Experiment not found.");
  }

  const selectedVariant = await Variant.findById(selectedVariantId);
  if (!selectedVariant) {
    throw new ApiError(404, "Selected variant not found.");
  }

  selectedVariant.clicks += 1;
  await selectedVariant.save();

  const loserIds = shownVariantIds.filter((variantId) => variantId !== selectedVariantId);

  await recordPosteriorUpdate({
    experimentId,
    winnerVariantId: selectedVariantId,
    loserVariantIds: loserIds
  });

  res.status(201).json({ message: "Click recorded and posterior updated." });
});

export const recordOutcome = asyncHandler(async (req, res) => {
  const { experimentId, variantId, outcome } = req.body;
  const experiment = await Experiment.findById(experimentId);

  if (!experiment) {
    throw new ApiError(404, "Experiment not found.");
  }

  const variant = await Variant.findById(variantId);
  if (!variant) {
    throw new ApiError(404, "Variant not found.");
  }

  if (outcome === "success") {
    variant.clicks += 1;
    await variant.save();
  } else if (outcome !== "failure") {
    throw new ApiError(400, "Outcome must be either success or failure.");
  }

  await recordBinaryOutcome({ experimentId, variantId, outcome });

  res.status(201).json({ message: `Recorded ${outcome} outcome.` });
});
