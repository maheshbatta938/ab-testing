import { Route, Routes } from "react-router-dom";

import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { CreateExperimentPage } from "./pages/CreateExperimentPage";
import { ExperimentDetailsPage } from "./pages/ExperimentDetailsPage";
import { ExperimentsPage } from "./pages/ExperimentsPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { TestExperimentPage } from "./pages/TestExperimentPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/test/:id" element={<TestExperimentPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/experiments" element={<ExperimentsPage />} />
        <Route path="/experiments/new" element={<CreateExperimentPage />} />
        <Route path="/experiments/:id" element={<ExperimentDetailsPage />} />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
      </Route>
    </Routes>
  );
}
