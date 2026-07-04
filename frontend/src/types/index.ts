export type Role = "user" | "admin";
export type ExperimentMode = "side_by_side" | "thompson_sampling";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface VariantResult {
  _id: string;
  name: string;
  htmlContent: string;
  cssContent: string;
  clicks: number;
  impressions: number;
  conversionRate: number;
  alpha: number;
  beta: number;
  probabilityBest: number;
}

export interface Experiment {
  _id: string;
  title: string;
  description: string;
  createdBy: User;
  variantCount: number;
  mode: ExperimentMode;
  status: "draft" | "running" | "paused" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface ExperimentDetailsResponse {
  experiment: Experiment;
  variants: VariantResult[];
}

export interface AllocationResponse {
  experiment?: Pick<Experiment, "_id" | "title" | "mode" | "status">;
  allocation: {
    recommendedVariantId: string;
    rankedVariants: Array<{
      variantId: string;
      variantName: string;
      sampledScore: number;
      alpha: number;
      beta: number;
      probabilityBest: number;
    }>;
  };
  variants: VariantResult[];
}

export interface ServeVariantResponse {
  experiment: Pick<Experiment, "_id" | "title" | "mode" | "status">;
  selectedVariant: Pick<
    VariantResult,
    "_id" | "name" | "htmlContent" | "cssContent" | "clicks" | "impressions"
  >;
  rankedVariants: AllocationResponse["allocation"]["rankedVariants"];
}
