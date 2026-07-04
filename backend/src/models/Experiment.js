import mongoose from "mongoose";

const experimentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    variantCount: {
      type: Number,
      required: true,
      min: 2
    },
    variantIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variant"
      }
    ],
    mode: {
      type: String,
      enum: ["side_by_side", "thompson_sampling"],
      default: "side_by_side"
    },
    status: {
      type: String,
      enum: ["draft", "running", "paused", "completed"],
      default: "draft"
    }
  },
  { timestamps: true }
);

export const Experiment = mongoose.model("Experiment", experimentSchema);
