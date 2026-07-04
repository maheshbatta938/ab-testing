const randomNormal = () => {
  let u = 0;
  let v = 0;

  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();

  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const randomGamma = (shape) => {
  if (shape < 1) {
    const u = Math.random();
    return randomGamma(shape + 1) * Math.pow(u, 1 / shape);
  }

  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);

  while (true) {
    const x = randomNormal();
    const v = Math.pow(1 + c * x, 3);

    if (v <= 0) {
      continue;
    }

    const u = Math.random();

    if (u < 1 - 0.0331 * Math.pow(x, 4)) {
      return d * v;
    }

    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
      return d * v;
    }
  }
};

export const sampleBeta = (alpha, beta) => {
  const x = randomGamma(alpha);
  const y = randomGamma(beta);
  return x / (x + y);
};
