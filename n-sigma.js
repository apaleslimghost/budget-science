module.exports = (n, σ, μ) => x => (μ - n*σ) <= x && x <= (μ + n*σ);
