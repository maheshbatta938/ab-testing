import { Link } from "react-router-dom";

import { ButtonLink } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function HomePage() {
  return (
    <div className="landing-page">
      <div className="landing-nav">
        <Link to="/" className="brand brand-dark">
          Bayesian A/B Lab
        </Link>
        <div className="landing-nav-actions">
          <ButtonLink to="/login" variant="ghost" size="sm">
            Login
          </ButtonLink>
          <ButtonLink to="/register" size="sm">
            Register
          </ButtonLink>
        </div>
      </div>
      <header className="landing-header">
        <div>
          <p className="eyebrow">Bayesian Experimentation Platform</p>
          <h1>Launch adaptive A/B tests that learn where to send the next visitor.</h1>
          <p className="landing-copy">
            Build experiments with custom HTML and CSS, compare variants side by side, or switch into
            Thompson Sampling mode to push more users toward the strongest posterior.
          </p>
        </div>
        <div className="landing-actions">
          <ButtonLink to="/login" size="lg">
            Login
          </ButtonLink>
          <ButtonLink to="/register" variant="ghost" size="lg">
            Register
          </ButtonLink>
        </div>
      </header>

      <section className="landing-grid">
        <Card tone="accent">
          <p className="eyebrow">How It Works</p>
          <h2>Create, render, learn</h2>
          <p>
            Users create experiments, define variants with HTML and CSS, and review posteriors,
            conversion rates, and probability-best estimates.
          </p>
        </Card>
        <Card>
          <p className="eyebrow">Adaptive Allocation</p>
          <h2>Real Thompson Sampling</h2>
          <p>
            In allocator mode, the system samples from each Beta posterior and serves only one
            variant to the next visitor, then updates that shown variant on success or failure.
          </p>
        </Card>
        <Card>
          <p className="eyebrow">Tester Experience</p>
          <h2>Separate participant flow</h2>
          <p>
            Test participants use a public testing route, so the experiment creator is no longer the
            default clicker in the evaluation loop.
          </p>
        </Card>
      </section>

      <section className="faq-section">
        <div className="page-header">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2>Common questions</h2>
          </div>
        </div>
        <div className="stack">
          <Card>
            <h3>Why use Bayesian allocation here?</h3>
            <p>
              Because it balances exploration and exploitation naturally, sending more traffic to
              promising variants while still learning from uncertain ones.
            </p>
          </Card>
          <Card>
            <h3>Who should use the testing page?</h3>
            <p>
              Ideally a separate participant or reviewer. The testing route is public so you can
              share it without requiring the experiment owner to be logged in as the tester.
            </p>
          </Card>
          <Card>
            <h3>Can anyone register as admin?</h3>
            <p>
              No. Public registration creates normal user accounts only. Admin accounts should come
              from seeded data or controlled backend setup.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
