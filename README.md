# Bayesian A/B Testing Platform

A full-stack web application for designing, running, and analyzing A/B experiments using **Bayesian Thompson Sampling**. The platform enables users to create multiple webpage variants, collect user interactions, and intelligently allocate traffic to the best-performing variant based on Bayesian probability.

## Features

* User authentication with JWT
* Role-based access control (Admin & User)
* Create experiments with **2–6 variants**
* HTML & CSS editor for custom variants
* Secure rendering using sandboxed iframes
* Two experiment modes:

  * **Side-by-Side Comparison**
  * **Bayesian Thompson Sampling**
* Automatic traffic allocation based on experiment performance
* Bayesian posterior updates using Beta distributions
* Monte Carlo simulation for probability estimation
* Experiment analytics and performance dashboard

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* CSS

### Backend

* Node.js
* Express.js
* MongoDB
* JWT Authentication

### Machine Learning / Statistics

* Bayesian Inference
* Thompson Sampling
* Beta Distribution
* Monte Carlo Simulation

---

## Project Workflow

1. Register or log in as a User or Admin.
2. Create a new A/B testing experiment.
3. Add between **2 and 6 webpage variants**.
4. Design each variant using custom HTML and CSS.
5. Select the experiment mode:

   * **Side-by-Side:** Users compare variants and choose their preferred version.
   * **Thompson Sampling:** Visitors are dynamically assigned a variant based on Bayesian probability.
6. Collect impressions, clicks, and user outcomes.
7. Update Bayesian posterior distributions after every interaction.
8. Display real-time probabilities to identify the best-performing variant.

---

## Bayesian Learning Process

The platform maintains a **Beta distribution** for every variant.

### Posterior Updates

**Side-by-Side Mode**

* Selected Variant → Alpha + 1
* Remaining Variants → Beta + 1

**Thompson Sampling Mode**

* Successful Outcome → Alpha + 1
* Unsuccessful Outcome → Beta + 1

The system continuously estimates the probability that each variant is the best using **Monte Carlo Simulation**, enabling adaptive traffic allocation throughout the experiment.

---

## REST API

### Authentication

* POST `/api/auth/register`
* POST `/api/auth/login`
* GET `/api/auth/me`

### Experiments

* POST `/api/experiments`
* GET `/api/experiments`
* GET `/api/experiments/:id`
* PATCH `/api/experiments/:id/status`

### Variants

* POST `/api/variants`
* GET `/api/variants/:experimentId`

### User Interactions

* POST `/api/interactions/record-impression`
* POST `/api/interactions/record-click`
* POST `/api/interactions/record-outcome`

### Bayesian Engine

* POST `/api/bayesian/update-posterior`
* GET `/api/bayesian/allocation/:experimentId`
* GET `/api/bayesian/summary/:experimentId`
* GET `/api/bayesian/serve/:experimentId`

### Admin

* GET `/api/admin/experiments`

---

## Database Schema

### User

* Name
* Email
* Password
* Role

### Experiment

* Title
* Description
* Created By
* Number of Variants
* Experiment Mode
* Status

### Variant

* Experiment ID
* Variant Name
* HTML Content
* CSS Content
* Impressions
* Clicks

### Bayesian State

* Experiment ID
* Variant ID
* Alpha
* Beta
* Probability Best

---

## Installation

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

Backend runs at:

```
http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## Demo Accounts

**Administrator**

```
Email: admin@example.com
Password: password123
```

**User**

```
Email: user@example.com
Password: password123
```

---

## Security

* JWT-based authentication
* Password hashing
* Role-based authorization
* HTML sanitization
* Protection against XSS attacks
* Sandboxed iframe rendering for user-generated content
* Environment variables for sensitive configuration

---

## Future Enhancements

* Multi-armed bandit algorithms
* Experiment scheduling
* Heatmap and click analytics
* Team collaboration
* Email notifications
* Advanced experiment reporting
* Export results as PDF and CSV

---

## License

This project is developed for educational and portfolio purposes.
