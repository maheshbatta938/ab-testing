import type {
  AllocationResponse,
  AuthResponse,
  Experiment,
  ExperimentDetailsResponse,
  ExperimentMode,
  ServeVariantResponse
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type HttpMethod = "GET" | "POST" | "PATCH";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("ab-token");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed." }));
    throw new Error(error.message || "Request failed.");
  }

  return response.json() as Promise<T>;
}

const send = <T>(method: HttpMethod, path: string, body?: unknown) =>
  request<T>(path, {
    method,
    body: body ? JSON.stringify(body) : undefined
  });

export const api = {
  register: (payload: { name: string; email: string; password: string }) =>
    send<AuthResponse>("POST", "/auth/register", payload),
  login: (payload: { email: string; password: string }) =>
    send<AuthResponse>("POST", "/auth/login", payload),
  me: () => request<{ user: AuthResponse["user"] }>("/auth/me"),
  getExperiments: () => request<{ experiments: Experiment[] }>("/experiments"),
  getExperiment: (id: string) => request<ExperimentDetailsResponse>(`/experiments/${id}`),
  createExperiment: (payload: {
    title: string;
    description: string;
    status: string;
    mode: ExperimentMode;
    variants: Array<{ name: string; htmlContent: string; cssContent: string }>;
  }) => send<ExperimentDetailsResponse>("POST", "/experiments", payload),
  updateExperimentStatus: (id: string, payload: { status?: string; mode?: ExperimentMode }) =>
    send<{ experiment: Experiment }>("PATCH", `/experiments/${id}/status`, payload),
  createVariant: (payload: {
    experimentId: string;
    name: string;
    htmlContent: string;
    cssContent: string;
  }) => send("POST", "/variants", payload),
  getVariants: (experimentId: string) => request<{ variants: ExperimentDetailsResponse["variants"] }>(`/variants/${experimentId}`),
  recordImpression: (payload: { experimentId: string; variantIds: string[] }) =>
    send("POST", "/interactions/record-impression", payload),
  recordClick: (payload: { experimentId: string; selectedVariantId: string; shownVariantIds: string[] }) =>
    send("POST", "/interactions/record-click", payload),
  recordOutcome: (payload: { experimentId: string; variantId: string; outcome: "success" | "failure" }) =>
    send("POST", "/interactions/record-outcome", payload),
  getAllocation: (experimentId: string) => request<AllocationResponse>(`/bayesian/allocation/${experimentId}`),
  serveVariant: (experimentId: string) => request<ServeVariantResponse>(`/bayesian/serve/${experimentId}`),
  updatePosterior: (payload: { experimentId: string; winnerVariantId: string; loserVariantId?: string }) =>
    send("POST", "/bayesian/update-posterior", payload),
  getBayesianSummary: (experimentId: string) =>
    request<{ variants: ExperimentDetailsResponse["variants"] }>(`/bayesian/summary/${experimentId}`),
  getAdminExperiments: () =>
    request<{ experiments: Array<Experiment & { variants: ExperimentDetailsResponse["variants"] }> }>("/admin/experiments")
};
