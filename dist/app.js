import { questions, scoreQuiz, shareUrl } from './data.js';
import { translations } from './i18n.js';

const app = document.querySelector('#app');
let saved;
try { saved = localStorage.getItem('hero-language'); } catch { /* Storage can be unavailable. */ }
const requested = new URL(location.href).searchParams.get('lang');
const valid = value => value === 'ja' || value === 'en';
let language = valid(requested) ? requested : valid(saved) ? saved : (navigator.languages?.[0] ?? navigator.language ?? '').startsWith('ja') ? 'ja' : 'en';
let screen = 'home';
let position = 0;
let answers = new Array(questions.length).fill(null);
let shareFallback = false;
let shareStatus = '';
const arrow = '<span aria-hidden="true">↗</span>';
const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function rememberLanguage() {
  try { localStorage.setItem('hero-language', language); } catch { /* Quiz works without storage. */ }
}
rememberLanguage();

function art(className = '') {
  return `<div class="hero-art ${className}"><img src="assets/hero-duo.png" alt="" width="1536" height="1024"><div class="art-grain" aria-hidden="true"></div><span class="art-coordinate" aria-hidden="true">SUBJECT 01 / SUBJECT 02</span></div>`;
}

function home(t) {
  return `<section class="landing" aria-labelledby="page-title"><div class="hero-copy"><p class="eyebrow"><span class="live-dot"></span>${t.eyebrow}</p><h1 id="page-title" tabindex="-1">${t.headline}</h1><p class="intro">${t.intro}</p><button type="button" class="primary" data-action="start">${t.start}${arrow}</button><div class="quick-facts"><span>◷ ${t.time}</span><span>▤ ${t.count}</span><span>◇ ${t.free}</span></div></div>${art()}<div class="hero-caption"><div class="subject spider"><span class="micro">01 / SPIDER-MAN</span><h2>${t.spiderName}</h2><p>${t.spiderTrait}</p></div><span class="versus" aria-hidden="true">VS</span><div class="subject deadpool"><span class="micro">02 / DEADPOOL</span><h2>${t.deadpoolName}</h2><p>${t.deadpoolTrait}</p></div></div><p class="art-note">${t.artNote}</p></section><section class="mission"><div class="mission-heading"><p class="eyebrow">${t.howLabel}</p><h2>${t.howTitle}</h2></div><div class="steps">${t.steps.map(([number, title, description]) => `<article><span class="step-number">${number}</span><h3>${title}</h3><p>${description}</p></article>`).join('')}</div></section>`;
}

function quiz(t) {
  const question = questions[position];
  const chosen = answers[position];
  return `<section class="quiz-panel" aria-labelledby="page-title"><div class="quiz-top"><span class="micro">HERO PERSONALITY TEST</span><span class="counter">${t.question} <b>${String(position + 1).padStart(2, '0')}</b> ${t.of} 12</span></div><div class="progress" role="progressbar" aria-label="${t.question}" aria-valuemin="0" aria-valuemax="12" aria-valuenow="${position + 1}"><span style="width:${(position + 1) / 12 * 100}%"></span></div><p class="eyebrow quiz-category">${t.dimensions[question.dimension]}</p><h1 id="page-title" tabindex="-1">${t.questionText[question.id]}</h1><fieldset><legend>${t.questionIntro}</legend><div class="choices">${t.choices.map((choice, value) => `<label class="choice ${chosen === value ? 'selected' : ''}"><input type="radio" name="answer" value="${value}" ${chosen === value ? 'checked' : ''}><span class="radio-dot" aria-hidden="true"></span><span>${choice}</span><span class="choice-number" aria-hidden="true">0${value + 1}</span></label>`).join('')}</div></fieldset><div class="quiz-navigation"><button class="text-button" type="button" data-action="back">← ${t.back}</button><button type="button" class="primary" data-action="next" ${chosen === null ? 'disabled' : ''}>${position === 11 ? t.results : t.next}${arrow}</button></div><p class="selection-hint" id="selection-hint">${chosen === null ? t.selectHint : '&nbsp;'}</p></section>`;
}

function shareText(t) {
  const result = scoreQuiz(answers);
  return `${t.shareText.replace('{spider}', result.spider).replace('{deadpool}', result.deadpool)}\n${shareUrl(location.href, language)}`;
}

function resultScreen(t) {
  const result = scoreQuiz(answers);
  const dominant = result.deadpool === 50 ? t.balancedTitle : `${result.deadpool > 50 ? t.deadpoolName : t.spiderName}${language === 'ja' ? '寄り' : ' leaning'}`;
  return `<section class="result" aria-labelledby="page-title"><div class="result-heading"><p class="eyebrow"><span class="live-dot"></span>${t.resultEyebrow}</p><p class="result-label">${t.resultLabel}</p><h1 id="page-title" tabindex="-1">${dominant}</h1><p class="result-tagline">${t.bandTitles[result.band]}</p></div><div class="result-card">${art('result-art')}<div class="result-scores"><div class="score spider"><span class="micro">SPIDER-MAN</span><strong>${result.spider}<small>%</small></strong><span>${t.spiderName} ${language === 'ja' ? '寄り' : 'leaning'}</span></div><div class="score deadpool"><span class="micro">DEADPOOL</span><strong>${result.deadpool}<small>%</small></strong><span>${t.deadpoolName} ${language === 'ja' ? '寄り' : 'leaning'}</span></div></div><div class="score-track" aria-hidden="true"><span style="width:${result.spider}%"></span></div><p class="result-description">${t.bandDescriptions[result.band]}</p></div><p class="methodology">${t.methodology}</p><section class="insights"><h2>${t.insightsTitle}</h2><p class="insights-intro">${t.insightsIntro}</p><div class="insight-grid">${result.strongest.map((dimension, index) => `<article><span class="step-number">0${index + 1}</span><h3>${t.dimensions[dimension.id]}</h3><p>${t.reasons[dimension.id][dimension.points < 4 ? 0 : dimension.points === 4 ? 1 : 2]}</p></article>`).join('')}</div></section><div class="result-actions"><button class="primary" type="button" data-action="share">${t.share}${arrow}</button><button class="secondary" type="button" data-action="copy">${t.copy}</button><button class="text-button" type="button" data-action="retry">↻ ${t.retry}</button></div><p class="share-status" role="status">${escape(shareStatus)}</p>${shareFallback ? `<div class="share-fallback"><label for="share-text">${t.shareBox}</label><textarea id="share-text" readonly rows="4">${escape(shareText(t))}</textarea></div>` : ''}</section>`;
}

function render({ focus = false } = {}) {
  const t = translations[language];
  document.documentElement.lang = language;
  document.title = t.title;
  document.querySelectorAll('[data-lang]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.lang === language));
  });
  document.querySelector('#footer-label').textContent = t.footer;
  document.querySelector('#disclaimer').textContent = t.disclaimer;
  app.innerHTML = screen === 'home' ? home(t) : screen === 'quiz' ? quiz(t) : resultScreen(t);
  if (focus) {
    document.querySelector('#page-title')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => {
  language = button.dataset.lang;
  rememberLanguage();
  shareStatus = '';
  render();
}));

app.addEventListener('change', event => {
  if (!event.target.matches('input[name="answer"]')) return;
  answers[position] = Number(event.target.value);
  app.querySelectorAll('.choice').forEach(label => label.classList.toggle('selected', label.querySelector('input').checked));
  app.querySelector('[data-action="next"]').disabled = false;
  app.querySelector('#selection-hint').innerHTML = '&nbsp;';
});

async function copyResult() {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(shareText(translations[language]));
    shareStatus = translations[language].copied;
    shareFallback = false;
  } catch {
    shareStatus = translations[language].copyFallback;
    shareFallback = true;
  }
  render();
  if (shareFallback) {
    const field = document.querySelector('#share-text');
    field.focus();
    field.select();
  } else {
    document.querySelector('[data-action="copy"]')?.focus({ preventScroll: true });
  }
}

app.addEventListener('click', async event => {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  switch (button.dataset.action) {
    case 'start': case 'retry':
      screen = 'quiz'; position = 0; answers = new Array(12).fill(null); shareFallback = false; shareStatus = ''; break;
    case 'back':
      if (position === 0) screen = 'home'; else position--; break;
    case 'next':
      if (answers[position] === null) return;
      if (position === 11) screen = 'result'; else position++; break;
    case 'copy': await copyResult(); return;
    case 'share':
      if (navigator.share) {
        try { await navigator.share({ title: 'HERO / WITHIN', text: shareText(translations[language]) }); }
        catch (error) { if (error.name !== 'AbortError') await copyResult(); }
      } else await copyResult();
      return;
  }
  render({ focus: true });
});

render();
