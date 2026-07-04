import { Experiment } from "../models/Experiment.js";
import { Variant } from "../models/Variant.js";
import { BayesianState } from "../models/BayesianState.js";
import { getExperimentResults, recalculateProbabilities } from "../services/bayesianService.js";
import { ApiError, asyncHandler } from "../utils/errors.js";
import { sanitizeMarkup } from "../utils/security.js";

export const createExperiment = asyncHandler(async (req, res) => {
  const { title, description, status = "draft", mode = "side_by_side", variants = [] } = req.body;

  if (!title || variants.length < 2) {
    throw new ApiError(400, "Title and at least two variants are required.");
  }

  const experiment = await Experiment.create({
    title,
    description,
    createdBy: req.user.id,
    variantCount: variants.length,
    mode,
    status
  });

  const createdVariants = await Variant.insertMany(
    variants.map((variant, index) => ({
      experimentId: experiment.id,
      name: variant.name || `Variant ${String.fromCharCode(65 + index)}`,
      htmlContent: sanitizeMarkup(variant.htmlContent),
      cssContent: sanitizeMarkup(variant.cssContent)
    }))
  );

  const bayesianStates = createdVariants.map((variant) => ({
    experimentId: experiment.id,
    variantId: variant.id,
    alpha: 1,
    beta: 1,
    probabilityBest: 1 / createdVariants.length
  }));

  await BayesianState.insertMany(bayesianStates);

  experiment.variantIds = createdVariants.map((variant) => variant.id);
  await experiment.save();
  await recalculateProbabilities(experiment.id);

  res.status(201).json({
    experiment,
    variants: await getExperimentResults(experiment.id)
  });
});

export const listExperiments = asyncHandler(async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { createdBy: req.user.id };
  const experiments = await Experiment.find(filter)
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });

  res.json({ experiments });
});

export const getExperimentById = asyncHandler(async (req, res) => {
  const experiment = await Experiment.findById(req.params.id).populate("createdBy", "name email role");

  if (!experiment) {
    throw new ApiError(404, "Experiment not found.");
  }

  const isOwner = experiment.createdBy._id.toString() === req.user.id;
  if (req.user.role !== "admin" && !isOwner) {
    throw new ApiError(403, "You do not have access to this experiment.");
  }

  const variants = await getExperimentResults(experiment.id);
  res.json({ experiment, variants });
});

export const updateExperimentStatus = asyncHandler(async (req, res) => {
  const { status, mode } = req.body;
  const experiment = await Experiment.findById(req.params.id);

  if (!experiment) {
    throw new ApiError(404, "Experiment not found.");
  }

  if (status) {
    experiment.status = status;
  }

  if (mode) {
    experiment.mode = mode;
  }

  await experiment.save();

  res.json({ experiment });
});
