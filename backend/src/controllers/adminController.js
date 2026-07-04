import { Experiment } from "../models/Experiment.js";
import { getExperimentResults } from "../services/bayesianService.js";
import { asyncHandler } from "../utils/errors.js";

export const getAdminDashboard = asyncHandler(async (_req, res) => {
  const experiments = await Experiment.find({})
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });

  const enrichedExperiments = await Promise.all(
    experiments.map(async (experiment) => ({
      ...experiment.toObject(),
      variants: await getExperimentResults(experiment.id)
    }))
  );

  res.json({ experiments: enrichedExperiments });
});
