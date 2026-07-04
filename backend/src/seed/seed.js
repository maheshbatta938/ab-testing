import dotenv from "dotenv";
import mongoose from "mongoose";

import { connectDatabase } from "../config/db.js";
import { BayesianState } from "../models/BayesianState.js";
import { Experiment } from "../models/Experiment.js";
import { User } from "../models/User.js";
import { Variant } from "../models/Variant.js";
import { recalculateProbabilities } from "../services/bayesianService.js";

dotenv.config();

const seed = async () => {
  await connectDatabase();

  await Promise.all([
    BayesianState.deleteMany({}),
    Variant.deleteMany({}),
    Experiment.deleteMany({}),
    User.deleteMany({})
  ]);

  const admin = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "admin"
  });

  const user = await User.create({
    name: "Experiment Owner",
    email: "user@example.com",
    password: "password123",
    role: "user"
  });

  const experiment = await Experiment.create({
    title: "Homepage hero CTA",
    description: "Testing which hero card drives more preference in side-by-side selection.",
    createdBy: user.id,
    variantCount: 2,
    mode: "thompson_sampling",
    status: "running"
  });

  const variants = await Variant.insertMany([
    {
      experimentId: experiment.id,
      name: "Variant A",
      htmlContent:
        '<section class="hero"><h1>Plan smarter launches</h1><p>See customer behavior before you scale.</p><button>Start free trial</button></section>',
      cssContent:
        ".hero{padding:32px;background:#eff6ff;text-align:center} h1{color:#1d4ed8} button{background:#1d4ed8;color:#fff;border:none;padding:12px 18px;border-radius:8px;}",
      impressions: 48,
      clicks: 17
    },
    {
      experimentId: experiment.id,
      name: "Variant B",
      htmlContent:
        '<section class="hero alt"><h1>Win every release window</h1><p>Use Bayesian learning to route traffic toward what works.</p><button>Book a demo</button></section>',
      cssContent:
        ".hero{padding:32px;background:#ecfdf5;text-align:center} h1{color:#047857} button{background:#047857;color:#fff;border:none;padding:12px 18px;border-radius:999px;}",
      impressions: 48,
      clicks: 26
    }
  ]);

  experiment.variantIds = variants.map((variant) => variant.id);
  await experiment.save();

  await BayesianState.insertMany([
    {
      experimentId: experiment.id,
      variantId: variants[0].id,
      alpha: 18,
      beta: 32
    },
    {
      experimentId: experiment.id,
      variantId: variants[1].id,
      alpha: 27,
      beta: 23
    }
  ]);

  await recalculateProbabilities(experiment.id);

  console.log("Seed complete");
  console.log("Admin login: admin@example.com / password123");
  console.log("User login: user@example.com / password123");

  await mongoose.connection.close();
};

seed().catch(async (error) => {
  console.error("Seed failed", error);
  await mongoose.connection.close();
  process.exit(1);
});
