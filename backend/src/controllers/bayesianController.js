import { Experiment } from "../models/Experiment.js";
import {
  getAllocationRecommendation,
  getExperimentResults,
  recalculateProbabilities,
  recordPosteriorUpdate,
  serveVariantForVisitor
} from "../services/bayesianService.js";
import { ApiError, asyncHandler } from "../utils/errors.js";

export const updatePosterior = asyncHandler(async (req, res) => {
  const { experimentId, winnerVariantId, loserVariantId } = req.body;
  const experiment = await Experiment.findById(experimentId);

  if (!experiment) {
    throw new ApiError(404, "Experiment not found.");
  }

  const states = await recordPosteriorUpdate({ experimentId, winnerVariantId, loserVariantId });
  res.json({ states });
});

export const getAllocation = asyncHandler(async (req, res) => {
  const experiment = await Experiment.findById(req.params.experimentId);

  if (!experiment) {
    throw new ApiError(404, "Experiment not found.");
  }

  const allocation = await getAllocationRecommendation(req.params.experimentId);
  const variants = await getExperimentResults(req.params.experimentId);

  res.json({
    experiment: {
      _id: experiment.id,
      mode: experiment.mode,
      status: experiment.status,
      title: experiment.title
    },
    allocation,
    variants
  });
});

export const getBayesianSummary = asyncHandler(async (req, res) => {
  await recalculateProbabilities(req.params.experimentId);
  const variants = await getExperimentResults(req.params.experimentId);
  res.json({ variants });
});

export const serveVariant = asyncHandler(async (req, res) => {
  const experiment = await Experiment.findById(req.params.experimentId);

  if (!experiment) {
    throw new ApiError(404, "Experiment not found.");
  }

  if (experiment.status !== "running") {
    throw new ApiError(400, "Experiment must be running to serve traffic.");
  }

  const allocation = await serveVariantForVisitor(experiment.id);

  res.json({
    experiment: {
      _id: experiment.id,
      mode: experiment.mode,
      status: experiment.status,
      title: experiment.title
    },
    ...allocation
  });
});
