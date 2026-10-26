import test from 'node:test';
import assert from 'node:assert/strict';
import * as risk from '../src/risk.js';

test('hazard scoring helpers exist', () => {
  assert.equal(typeof risk.analyzeForecast, 'function');
  assert.equal(typeof risk.riskLabel, 'function');
  assert.equal(typeof risk.formatHour, 'function');
});
test('risk severity is clamped to safe finite range', () => {
  assert.equal(risk.clamp(-99), 0);
  assert.equal(risk.clamp(120), 100);
  assert.equal(risk.clamp(Number.NaN), 0);
});
test('storm severity recognizes thunderstorm codes', () => {
  assert.equal(risk.stormSeverity(95), 100);
  assert.equal(risk.stormSeverity(99), 100);
  assert.ok(risk.stormSeverity(0) < 100);
});
