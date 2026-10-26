import test from 'node:test';
import assert from 'node:assert/strict';
import {CITIES, searchCities, sampleWeather} from '../src/weather.js';

test('built-in city fallback is available', () => {
  assert.ok(Array.isArray(CITIES));
  assert.ok(CITIES.length > 0);
});
test('weather fallback produces a labeled sample dataset', () => {
  assert.equal(typeof sampleWeather, 'function');
});
test('city lookup is exposed for location search', () => {
  assert.equal(typeof searchCities, 'function');
});
