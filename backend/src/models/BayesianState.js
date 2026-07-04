import mongoose from "mongoose";

const bayesianStateSchema = new mongoose.Schema(
  {
    experimentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experiment",
      required: true
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: true,
      unique: true
    },
    alpha: {
      type: Number,
      default: 1
    },
    beta: {
      type: Number,
      default: 1
    },
    probabilityBest: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export const BayesianState = mongoose.model("BayesianState", bayesianStateSchema);
