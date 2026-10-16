import test from 'node:test';
import assert from 'node:assert/strict';
import { questions, scoreQuiz, shareUrl } from '../dist/data.js';
import { translations } from '../dist/i18n.js';

test('opposite endpoints give 0/100 and 100/0, respecting reversed scoring', () => {
  const maximum = questions.map(q => q.direction === 1 ? 4 : 0);
  const minimum = maximum.map(value => 4 - value);
  assert.equal(scoreQuiz(maximum).deadpool, 100);
  assert.equal(scoreQuiz(minimum).spider, 100);
  const neutral = scoreQuiz(Array(12).fill(2));
  assert.equal(neutral.deadpool, 50);
  assert.equal(neutral.band, 'balanced');
  assert.ok(Object.values(neutral.dimensions).every(points => points === 4));
});
test('all 5^6 repeated-dimension combinations sum to 100 and stay in range', () => {
  for (let pattern = 0; pattern < 15625; pattern++) {
    let value = pattern;
    const half = Array.from({ length: 6 }, () => { const answer = value % 5; value = Math.floor(value / 5); return answer; });
    const result = scoreQuiz([...half, ...half]);
    assert.equal(result.spider + result.deadpool, 100);
    assert.ok(result.spider >= 0 && result.spider <= 100);
    assert.equal(result.strongest.length, 3);
  }
});
test('incomplete, sparse and invalid answers are rejected', () => {
  for (const invalid of [[], Array(12), Array(12).fill(null), Array(12).fill(5), Array(12).fill(1.5), Array(12).fill('2')]) {
    assert.throws(() => scoreQuiz(invalid));
  }
});
test('language dictionaries have matching leaf keys and translated questions', () => {
  function keys(object, prefix = '') {
    return Object.entries(object).flatMap(([key, value]) => typeof value === 'object' ? keys(value, `${prefix}${key}.`) : [`${prefix}${key}`]).sort();
  }
  assert.deepEqual(keys(translations.ja), keys(translations.en));
  for (const language of ['ja', 'en']) {
    for (const question of questions) {
      assert.ok(translations[language].questionText[question.id]);
      assert.equal(translations[language].reasons[question.dimension].length, 3);
    }
    assert.equal(translations[language].choices.length, 5);
  }
});
test('share URL removes answers, other query parameters and hash', () => {
  assert.equal(shareUrl('https://example.com/quiz/?answers=123&lang=ja#result', 'en'), 'https://example.com/quiz/?lang=en');
  assert.equal(shareUrl('https://example.com/', 'ja'), 'https://example.com/?lang=ja');
});
test('score bands and strongest dimensions follow answer changes', () => {
  const baseline = Array(12).fill(2);
  const changed = [...baseline]; changed[0] = 4; changed[6] = 4;
  const result = scoreQuiz(changed);
  assert.equal(result.strongest[0].id, 'responsibility');
  assert.equal(result.strongest[0].points, 0);
  assert.equal(result.band, 'spider');
  assert.deepEqual(scoreQuiz(changed), scoreQuiz(changed));
});
