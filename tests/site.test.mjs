import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';

for (const path of ['index.html','admin.html']) {
  test(`${path} has a readable document`, () => {
    const markup = readFileSync(path,'utf8');
    assert.match(markup, /<!doctype html>/i);
    assert.match(markup, /<title>/i);
  });
}
test('public page links to actual modular scripts', () => {
  const html = readFileSync('index.html','utf8');
  for (const path of ['src/main.js','src/config.js','styles/app.css','styles/enhancements.css']) {
    assert.ok(existsSync(path), path);
    assert.ok(html.includes(path), path);
  }
});
test('admin page remains a separate entrypoint', () => {
  const html=readFileSync('admin.html','utf8');
  assert.ok(html.includes('src/moderation.js'));
});
