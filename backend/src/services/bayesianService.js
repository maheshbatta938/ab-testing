import { BayesianState } from "../models/BayesianState.js";
import { Variant } from "../models/Variant.js";
import { sampleBeta } from "../utils/beta.js";
import { ApiError } from "../utils/errors.js";

const MONTE_CARLO_RUNS = 3000;

export const recalculateProbabilities = async (experimentId) => {
  const states = await BayesianState.find({ experimentId }).sort({ createdAt: 1 });

  if (states.length === 0) {
    return [];
  }

  const bestCounts = new Map(states.map((state) => [state.variantId.toString(), 0]));

  for (let index = 0; index < MONTE_CARLO_RUNS; index += 1) {
    let bestState = null;
    let bestScore = -1;

    states.forEach((state) => {
      const score = sampleBeta(state.alpha, state.beta);

      if (score > bestScore) {
        bestScore = score;
        bestState = state;
      }
    });

    bestCounts.set(
      bestState.variantId.toString(),
      (bestCounts.get(bestState.variantId.toString()) ?? 0) + 1
    );
  }

  await Promise.all(
    states.map((state) => {
      state.probabilityBest = (bestCounts.get(state.variantId.toString()) ?? 0) / MONTE_CARLO_RUNS;
      return state.save();
    })
  );

  return BayesianState.find({ experimentId }).populate("variantId", "name clicks impressions");
};

export const recordPosteriorUpdate = async ({
  experimentId,
  winnerVariantId,
  loserVariantId,
  loserVariantIds = []
}) => {
  const winnerState = await BayesianState.findOne({ experimentId, variantId: winnerVariantId });

  if (!winnerState) {
    throw new ApiError(404, "Winner Bayesian state was not found.");
  }

  // A user selecting a variant is modeled as a success in its Beta posterior.
  winnerState.alpha += 1;
  await winnerState.save();

  const allLoserIds = [...new Set([loserVariantId, ...loserVariantIds].filter(Boolean))];

  await Promise.all(
    allLoserIds.map(async (currentLoserId) => {
      const loserState = await BayesianState.findOne({ experimentId, variantId: currentLoserId });

      if (loserState) {
        // Non-selected variants receive a failure update to reflect the lost preference event.
        loserState.beta += 1;
        await loserState.save();
      }
    })
  );

  return recalculateProbabilities(experimentId);
};

export const recordBinaryOutcome = async ({ experimentId, variantId, outcome }) => {
  const state = await BayesianState.findOne({ experimentId, variantId });

  if (!state) {
    throw new ApiError(404, "Bayesian state was not found.");
  }

  if (outcome === "success") {
    // Thompson Sampling treats conversions as posterior successes.
    state.alpha += 1;
  } else if (outcome === "failure") {
    // Non-converting impressions are posterior failures for the shown variant.
    state.beta += 1;
  } else {
    throw new ApiError(400, "Outcome must be either success or failure.");
  }

  await state.save();
  return recalculateProbabilities(experimentId);
};

export const getAllocationRecommendation = async (experimentId) => {
  const states = await BayesianState.find({ experimentId }).populate("variantId", "name clicks impressions");

  if (states.length === 0) {
    throw new ApiError(404, "No Bayesian state found for this experiment.");
  }

  const ranked = states
    .map((state) => ({
      variantId: state.variantId._id,
      variantName: state.variantId.name,
      sampledScore: sampleBeta(state.alpha, state.beta),
      alpha: state.alpha,
      beta: state.beta,
      probabilityBest: state.probabilityBest
    }))
    .sort((a, b) => b.sampledScore - a.sampledScore);

  return {
    recommendedVariantId: ranked[0].variantId,
    rankedVariants: ranked
  };
};

export const serveVariantForVisitor = async (experimentId) => {
  const states = await BayesianState.find({ experimentId }).populate(
    "variantId",
    "name htmlContent cssContent clicks impressions"
  );

  if (states.length === 0) {
    throw new ApiError(404, "No Bayesian state found for this experiment.");
  }

  const rankedVariants = states
    .map((state) => ({
      variantId: state.variantId._id.toString(),
      variantName: state.variantId.name,
      sampledScore: sampleBeta(state.alpha, state.beta),
      alpha: state.alpha,
      beta: state.beta,
      probabilityBest: state.probabilityBest
    }))
    .sort((a, b) => b.sampledScore - a.sampledScore);

  const selectedVariant = states.find(
    (state) => state.variantId._id.toString() === rankedVariants[0].variantId
  )?.variantId;

  if (!selectedVariant) {
    throw new ApiError(404, "Selected variant could not be resolved.");
  }

  return {
    selectedVariant: {
      _id: selectedVariant._id.toString(),
      name: selectedVariant.name,
      htmlContent: selectedVariant.htmlContent,
      cssContent: selectedVariant.cssContent,
      clicks: selectedVariant.clicks,
      impressions: selectedVariant.impressions
    },
    rankedVariants
  };
};

export const getExperimentResults = async (experimentId) => {
  const variants = await Variant.find({ experimentId }).sort({ createdAt: 1 });
  const states = await BayesianState.find({ experimentId }).sort({ createdAt: 1 });

  return variants.map((variant) => {
    const state = states.find((entry) => entry.variantId.toString() === variant.id);
    const conversionRate = variant.impressions ? variant.clicks / variant.impressions : 0;

    return {
      _id: variant.id,
      name: variant.name,
      htmlContent: variant.htmlContent,
      cssContent: variant.cssContent,
      clicks: variant.clicks,
      impressions: variant.impressions,
      conversionRate,
      alpha: state?.alpha ?? 1,
      beta: state?.beta ?? 1,
      probabilityBest: state?.probabilityBest ?? 0
    };
  });
};
