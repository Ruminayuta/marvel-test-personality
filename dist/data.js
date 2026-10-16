// Positive direction: agreement increases the Deadpool-leaning score.
// IDs, dimensions and numeric answers are independent of display language.
export const questions = [
  { id: 'promise', dimension: 'responsibility', direction: -1 },
  { id: 'improvise', dimension: 'rules', direction: 1 },
  { id: 'notice', dimension: 'empathy', direction: -1 },
  { id: 'joke', dimension: 'humor', direction: 1 },
  { id: 'leap', dimension: 'boldness', direction: 1 },
  { id: 'recover', dimension: 'resilience', direction: 1 },
  { id: 'finish', dimension: 'responsibility', direction: -1 },
  { id: 'question', dimension: 'rules', direction: 1 },
  { id: 'listen', dimension: 'empathy', direction: -1 },
  { id: 'tease', dimension: 'humor', direction: 1 },
  { id: 'prepare', dimension: 'boldness', direction: -1 },
  { id: 'reflect', dimension: 'resilience', direction: -1 },
];

export function scoreQuiz(answers) {
  if (!Array.isArray(answers) || answers.length !== questions.length ||
      Array.from(answers).some(value => !Number.isInteger(value) || value < 0 || value > 4)) {
    throw new Error('All 12 answers must be integers from 0 to 4.');
  }
  const dimensions = {};
  let total = 0;
  questions.forEach((question, index) => {
    const points = question.direction === 1 ? answers[index] : 4 - answers[index];
    total += points;
    dimensions[question.dimension] = (dimensions[question.dimension] ?? 0) + points;
  });
  const deadpool = Math.round(total / 48 * 100);
  const strongest = Object.entries(dimensions)
    .map(([id, points], order) => ({ id, points, strength: Math.abs(points - 4), order }))
    .sort((a, b) => b.strength - a.strength || a.order - b.order)
    .slice(0, 3);
  return { spider: 100 - deadpool, deadpool, dimensions, strongest,
    band: deadpool === 50 ? 'balanced' : deadpool < 25 ? 'spiderStrong' : deadpool < 50 ? 'spider' : deadpool <= 75 ? 'deadpool' : 'deadpoolStrong' };
}

export function shareUrl(href, language) {
  const url = new URL(href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('lang', language === 'ja' ? 'ja' : 'en');
  return url.href;
}
