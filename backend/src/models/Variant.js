import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    experimentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experiment",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    htmlContent: {
      type: String,
      default: ""
    },
    cssContent: {
      type: String,
      default: ""
    },
    clicks: {
      type: Number,
      default: 0
    },
    impressions: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export const Variant = mongoose.model("Variant", variantSchema);
