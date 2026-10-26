# Weather Hazard Index — design note

PowerGuard computes a **weather hazard index**, not the probability of losing power.
The risk module estimates normalized weather severity from forecast wind gusts,
precipitation and coded storm conditions, combining the signals into a 0–100 index.

The weights are **illustrative design assumptions**, not statistically calibrated.
Weather is just one potential driver of grid disruptions. Tree cover, feeder status,
planned shutdowns, infrastructure quality and operational decisions are not modeled.

## How to interpret the dashboard

- Use the score to prioritize preparation, not to estimate an outage likelihood.
- Explain the component weather signals alongside the index.
- Never announce precise outage or restoration times based on the score.
- Show a clear SAMPLE DATA warning if the forecast provider is unavailable.

## Future improvements

Collect externally validated outage labels with consent, establish data coverage,
run retrospective backtesting against proper baselines, and calibrate before
calling anything a probability or predictive model.
