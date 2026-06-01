var GITHUB_URL = 'https://github.com/lautaroppaniagua/AnthropicCertification';

var DOMAINS = [
  null,
  { label: 'Agentic Architecture & Orchestration', short: 'Agentic Architecture', weight: 27 },
  { label: 'Tool Design & MCP Integration',         short: 'Tool Design & MCP',    weight: 18 },
  { label: 'Claude Code Configuration & Workflows', short: 'Claude Code Config',   weight: 20 },
  { label: 'Prompt Engineering & Structured Output',short: 'Prompt Engineering',   weight: 20 },
  { label: 'Context Management & Reliability',      short: 'Context Management',   weight: 15 }
];

var includeExperimental = false;

function toggleExperimental() {
  includeExperimental = !includeExperimental;
  renderStart();
}

var state = {
  questions: [],
  current: 0,
  answers: {},      // { questionId: [selectedIndices] }
  confirmed: {},    // { questionId: true }
  elapsed: 0,
  timerInterval: null
};

function initTheme() {
  var saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme');
  var next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  var btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = next === 'dark' ? '☀' : '☾';
}

function themeIcon() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? '☀' : '☾';
}

function themeToggleBtn() {
  return '<button id="theme-toggle" class="btn-theme" onclick="toggleTheme()" title="Cambiar tema">' + themeIcon() + '</button>';
}

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function shuffleQuestionOptions(q) {
  var letters = ['A', 'B', 'C', 'D', 'E'];
  var indexed = q.options.map(function(text, i) {
    return { text: text, originalIdx: i };
  });
  var shuffled = shuffle(indexed);

  // letterMap: old letter -> new letter, based on where each original option landed
  var letterMap = {};
  shuffled.forEach(function(item, newIdx) {
    letterMap[letters[item.originalIdx]] = letters[newIdx];
  });

  var newCorrect = [];
  shuffled.forEach(function(item, i) {
    if (q.correct.indexOf(item.originalIdx) !== -1) newCorrect.push(i);
  });

  return Object.assign({}, q, {
    options: shuffled.map(function(o) { return o.text; }),
    correct: newCorrect,
    explanation: remapExplanationLetters(q.explanation, letterMap)
  });
}

// Rewrites option-letter references in explanation text to match the shuffled order.
// Handles "Option X", "Options X and Y", "Options X, Y, and Z", and "(X)" parentheticals.
function remapExplanationLetters(text, letterMap) {
  // Pass 1: "Option(s) X" possibly followed by ", Y", " and Z", " or W"
  text = text.replace(
    /\b(Options?\s+)([A-E](?:[,\s]+(?:and\s+|or\s+)?[A-E])*)\b/g,
    function(_, optPrefix, letterList) {
      return optPrefix + letterList.replace(/[A-E]/g, function(L) {
        return letterMap[L] || L;
      });
    }
  );
  // Pass 2: parenthetical letter refs like "(A)", "(B)"
  text = text.replace(/\(([A-E])\)/g, function(_, letter) {
    return '(' + (letterMap[letter] || letter) + ')';
  });
  return text;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatTime(s) {
  var h = Math.floor(s / 3600);
  var m = Math.floor((s % 3600) / 60);
  var sec = s % 60;
  if (h > 0) return pad(h) + ':' + pad(m) + ':' + pad(sec);
  return pad(m) + ':' + pad(sec);
}

function experimentalCount() {
  return QUESTIONS.filter(function(q) { return !q.official; }).length;
}

function questionCount() {
  return QUESTIONS.filter(function(q) { return includeExperimental || q.official; }).length;
}

function officialBadge(q) {
  if (q.official) {
    return '<span class="badge badge-official">✓ Pregunta oficial</span>';
  }
  return '<span class="badge badge-experimental">⚠ Pregunta experimental</span>';
}

function domainBadge(q) {
  if (!q.domain) return '';
  var d = DOMAINS[q.domain];
  return '<span class="badge badge-domain badge-domain-' + q.domain + '">D' + q.domain + ' · ' + d.short + '</span>';
}

function init() {
  initTheme();
  renderStart();
}

function startExam() {
  var pool = QUESTIONS.filter(function(q) {
    return includeExperimental || q.official;
  });
  state.questions = shuffle(pool).map(shuffleQuestionOptions);
  state.current = 0;
  state.answers = {};
  state.confirmed = {};
  state.elapsed = 0;
  state.timerInterval = setInterval(function() {
    state.elapsed++;
    var el = document.getElementById('timer');
    if (el) el.textContent = formatTime(state.elapsed);
  }, 1000);
  renderQuestion(0);
}

function confirmedCount() {
  return Object.keys(state.confirmed).length;
}

function answeredCount() {
  return Object.keys(state.answers).filter(function(id) {
    return state.answers[id] && state.answers[id].length > 0;
  }).length;
}

function toggleAnswer(id, index, isMultiple) {
  if (state.confirmed[id]) return;
  var current = state.answers[id] ? state.answers[id].slice() : [];
  if (isMultiple) {
    var pos = current.indexOf(index);
    if (pos !== -1) current.splice(pos, 1);
    else current.push(index);
  } else {
    current = [index];
  }
  state.answers[id] = current;
  renderQuestion(state.current);
}

function confirmAnswer(id) {
  var ans = state.answers[id];
  if (!ans || ans.length === 0) return;
  state.confirmed[id] = true;
  renderQuestion(state.current);
}

function navigate(dir) {
  var next = state.current + dir;
  if (next < 0 || next >= state.questions.length) return;
  state.current = next;
  renderQuestion(state.current);
}

function showResults() {
  clearInterval(state.timerInterval);
  var elapsed = state.elapsed;

  var score = 0;
  state.questions.forEach(function(q) {
    var ans = (state.answers[q.id] || []).slice().sort();
    var correct = q.correct.slice().sort();
    if (JSON.stringify(ans) === JSON.stringify(correct)) score++;
  });

  var total = state.questions.length;
  var pct = Math.round((score / total) * 100);
  var pass = pct >= 70;

  // ── per-domain breakdown ──────────────────────────────
  var ds = {};
  for (var d = 1; d <= 5; d++) ds[d] = { total: 0, correct: 0 };
  state.questions.forEach(function(q) {
    if (!q.domain) return;
    ds[q.domain].total++;
    var ans = (state.answers[q.id] || []).slice().sort();
    var cor = q.correct.slice().sort();
    if (JSON.stringify(ans) === JSON.stringify(cor)) ds[q.domain].correct++;
  });

  var domainRowsHtml = '';
  for (var di = 1; di <= 5; di++) {
    var dstat = ds[di];
    if (dstat.total === 0) continue;
    var dpct = Math.round(dstat.correct / dstat.total * 100);
    domainRowsHtml +=
      '<div class="domain-row">' +
        '<div class="domain-row-header">' +
          '<span class="badge badge-domain badge-domain-' + di + '">D' + di + '</span>' +
          '<span class="domain-row-name">' + DOMAINS[di].short + '</span>' +
          '<span class="domain-row-right">' +
            '<span class="domain-row-score">' + dstat.correct + '/' + dstat.total + '</span>' +
            '<span class="domain-row-pct ' + (dpct >= 70 ? 'dpct-pass' : 'dpct-fail') + '">' + dpct + '%</span>' +
          '</span>' +
        '</div>' +
        '<div class="domain-bar-track">' +
          '<div class="domain-bar-fill domain-bar-fill-' + di + '" style="width:' + dpct + '%"></div>' +
        '</div>' +
      '</div>';
  }

  // ── SVG donut ─────────────────────────────────────────
  var R = 54, C = +(2 * Math.PI * R).toFixed(2);
  var arc = +(C * pct / 100).toFixed(2);
  var gap = +(C - arc).toFixed(2);
  var strokeColor = pass ? 'var(--success)' : 'var(--error)';

  var donutSvg =
    '<svg class="score-donut" viewBox="0 0 120 120" width="130" height="130" aria-hidden="true">' +
      '<circle cx="60" cy="60" r="' + R + '" fill="none" class="donut-track" stroke-width="11"/>' +
      '<circle cx="60" cy="60" r="' + R + '" fill="none" stroke="' + strokeColor + '" stroke-width="11"' +
        ' stroke-linecap="round"' +
        ' stroke-dasharray="' + arc + ' ' + gap + '"' +
        ' transform="rotate(-90 60 60)"/>' +
      '<text x="60" y="54" text-anchor="middle" class="donut-pct-text">' + pct + '%</text>' +
      '<text x="60" y="70" text-anchor="middle" class="donut-label-text">correcto</text>' +
    '</svg>';

  document.getElementById('app').innerHTML =
    '<div class="results-screen">' +
      '<div class="results-card">' +
        '<div class="start-theme-row">' + themeToggleBtn() + '</div>' +
        '<h2>Resultado final</h2>' +
        '<div class="score-summary">' +
          '<div class="score-donut-wrap">' + donutSvg + '</div>' +
          '<div class="score-info">' +
            '<div class="score-display">' +
              '<span class="score-number">' + score + '</span>' +
              '<span class="score-divider">/</span>' +
              '<span class="score-total">' + total + '</span>' +
            '</div>' +
            '<span class="score-pass-label ' + (pass ? 'pass' : 'fail') + '">' +
              (pass ? '✓ Aprobado' : '✗ A seguir estudiando') +
            '</span>' +
            '<p class="time-taken">Tiempo: ' + formatTime(elapsed) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="domain-breakdown">' +
          '<h3 class="domain-breakdown-title">Resultados por dominio</h3>' +
          domainRowsHtml +
        '</div>' +
        '<div class="results-actions">' +
          '<button class="btn-secondary" onclick="reviewAnswers()">Repasar respuestas</button>' +
          '<button class="btn-primary" onclick="restartExam()">Volver a empezar</button>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function reviewAnswers() {
  state.current = 0;
  renderQuestion(0);
}

function restartExam() {
  clearInterval(state.timerInterval);
  location.reload();
}

function renderStart() {
  document.getElementById('app').innerHTML =
    '<div class="start-screen">' +
      '<div class="start-card">' +
        '<div class="start-theme-row">' + themeToggleBtn() + '</div>' +
        '<div class="start-logo">🎯</div>' +
        '<h1>Simulador de Certificación Anthropic</h1>' +
        '<p class="start-subtitle">Poné a prueba tus conocimientos con ' + QUESTIONS.length + ' preguntas de opción múltiple</p>' +
        '<ul class="info-list">' +
          '<li>Las preguntas se aleatorizan en cada intento</li>' +
          '<li>Confirmá cada respuesta individualmente</li>' +
          '<li>La explicación se muestra luego de confirmar</li>' +
          '<li>El cronómetro registra cuánto tardás</li>' +
        '</ul>' +
        '<div class="toggle-row">' +
          '<label class="toggle-label" for="exp-toggle">' +
            '<span class="toggle-text">' +
              '<span>Incluir preguntas experimentales</span>' +
              '<span class="toggle-sub">' + experimentalCount() + ' preguntas adicionales marcadas con ⚠</span>' +
            '</span>' +
            '<span class="toggle-switch' + (includeExperimental ? ' toggle-on' : '') + '" onclick="toggleExperimental()" role="switch" aria-checked="' + includeExperimental + '">' +
              '<span class="toggle-knob"></span>' +
            '</span>' +
          '</label>' +
        '</div>' +
        '<button class="btn-primary" onclick="startExam()">' +
          'Comenzar examen' +
          ' <span class="btn-count">(' + questionCount() + ' preguntas)</span>' +
        '</button>' +
        '<a href="' + GITHUB_URL + '" target="_blank" rel="noopener noreferrer" class="github-link">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>' +
          'Ver en GitHub' +
        '</a>' +
      '</div>' +
    '</div>';
}

function renderQuestion(index) {
  state.current = index;
  var q = state.questions[index];
  var isConfirmed = !!state.confirmed[q.id];
  var isMultiple = q.correct.length > 1;
  var answered = state.answers[q.id] || [];
  var confirmed = confirmedCount();
  var total = state.questions.length;
  var pct = (confirmed / total) * 100;

  var optionsHtml = q.options.map(function(opt, i) {
    var cls = 'option';
    var iconHtml = '';
    if (isConfirmed) {
      cls += ' option-confirmed';
      var isCorrectOption = q.correct.indexOf(i) !== -1;
      var wasSelected = answered.indexOf(i) !== -1;
      if (isCorrectOption) {
        cls += ' option-correct';
        iconHtml = '<span class="option-icon">✓</span>';
      } else if (wasSelected) {
        cls += ' option-wrong';
        iconHtml = '<span class="option-icon">✗</span>';
      }
    } else if (answered.indexOf(i) !== -1) {
      cls += ' option-selected';
    }

    var clickAttr = isConfirmed
      ? ''
      : 'onclick="toggleAnswer(\'' + q.id + '\',' + i + ',' + isMultiple + ')"';

    return '<label class="' + cls + '" ' + clickAttr + '>' +
      '<span class="option-marker">' + String.fromCharCode(65 + i) + '</span>' +
      '<span class="option-text">' + escapeHtml(opt) + '</span>' +
      iconHtml +
    '</label>';
  }).join('');

  var bottomHtml;
  if (!isConfirmed) {
    var disabled = answered.length === 0 ? ' disabled' : '';
    bottomHtml = '<button class="btn-primary" onclick="confirmAnswer(\'' + q.id + '\')"' + disabled + '>Confirmar respuesta</button>';
  } else {
    var docLinkHtml = q.doc_link
      ? '<a href="' + q.doc_link + '" target="_blank" rel="noopener noreferrer" class="doc-link">Ver documentación oficial →</a>'
      : '';
    bottomHtml =
      '<div class="explanation-box">' +
        '<h4>Explicación</h4>' +
        '<p>' + escapeHtml(q.explanation) + '</p>' +
        docLinkHtml +
      '</div>';
  }

  var footerCenter =
    '<button class="btn-finish" onclick="showResults()">Ver resultados</button>' +
    (confirmed < total
      ? '<span class="confirmed-count">' + confirmed + '/' + total + ' confirmadas</span>'
      : '');

  document.getElementById('app').innerHTML =
    '<div class="exam-layout">' +
      '<header class="exam-header">' +
        '<span class="header-brand">Certificación Anthropic</span>' +
        '<div class="header-center">' +
          '<div class="progress-track">' +
            '<div class="progress-fill" style="width:' + pct + '%"></div>' +
          '</div>' +
          '<span class="progress-label">Pregunta ' + (index + 1) + ' de ' + total + '</span>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px">' +
          '<div id="timer" class="timer">' + formatTime(state.elapsed) + '</div>' +
          themeToggleBtn() +
        '</div>' +
      '</header>' +
      '<main class="exam-main">' +
        '<div class="question-card">' +
          (isMultiple ? '<span class="tag-multiple">Respuesta múltiple</span>' : '') +
          '<div class="badge-row">' + officialBadge(q) + domainBadge(q) + '</div>' +
          '<h2 class="question-text">' + escapeHtml(q.question) + '</h2>' +
          '<div class="options-list">' + optionsHtml + '</div>' +
          '<div class="claude-discuss-row">' +
            '<button class="btn-claude" id="claude-btn-' + q.id + '" onclick="copyClaudeMarkdown(\'' + q.id + '\')">' +
              '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>' +
              '<span>Copiar contexto</span>' +
            '</button>' +
          '</div>' +
          bottomHtml +
        '</div>' +
      '</main>' +
      '<footer class="exam-footer">' +
        '<button class="btn-secondary" onclick="navigate(-1)"' + (index === 0 ? ' disabled' : '') + '>← Anterior</button>' +
        '<div class="footer-center">' + footerCenter + '</div>' +
        '<button class="btn-secondary" onclick="navigate(1)"' + (index === total - 1 ? ' disabled' : '') + '>Siguiente →</button>' +
      '</footer>' +
    '</div>';
}

function buildClaudeMarkdown(q, isConfirmed) {
  var letters = ['A', 'B', 'C', 'D', 'E'];
  var lines = [];
  lines.push('## Pregunta — Certificación Anthropic');
  lines.push('');
  lines.push('**Pregunta:** ' + q.question);
  lines.push('');
  lines.push('**Opciones:**');
  q.options.forEach(function(opt, i) {
    lines.push('- ' + letters[i] + '. ' + opt);
  });
  if (isConfirmed) {
    var correctLetter = letters[q.correct[0]];
    lines.push('');
    lines.push('**Respuesta correcta:** ' + correctLetter + ' — ' + q.options[q.correct[0]]);
    lines.push('');
    lines.push('**Explicación:** ' + q.explanation);
    lines.push('');
    lines.push('---');
    lines.push('Quiero entender mejor esta pregunta. ¿Podés profundizar en por qué la opción ' + correctLetter + ' es la correcta y por qué las demás no lo son?');
  } else {
    lines.push('');
    lines.push('---');
    lines.push('Quiero entender mejor esta pregunta de la certificación de Anthropic. ¿Podés explicarme el concepto que evalúa y orientarme hacia la respuesta correcta?');
  }
  return lines.join('\n');
}

function getQuestion(qid) {
  return state.questions.filter(function(x) { return x.id === qid; })[0] || null;
}

function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand('copy'); } catch(e) {}
  document.body.removeChild(ta);
}

function doCopy(text, callback) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(callback).catch(function() {
      fallbackCopy(text); callback();
    });
  } else {
    fallbackCopy(text); callback();
  }
}

function copyClaudeMarkdown(qid) {
  var q = getQuestion(qid);
  if (!q) return;
  doCopy(buildClaudeMarkdown(q, !!state.confirmed[qid]), function() {
    var btn = document.getElementById('claude-btn-' + qid);
    if (!btn) return;
    var span = btn.querySelector('span');
    if (span) {
      btn.classList.add('btn-claude-copied');
      span.textContent = '✓ ¡Copiado!';
      setTimeout(function() {
        var b = document.getElementById('claude-btn-' + qid);
        if (b) {
          b.classList.remove('btn-claude-copied');
          b.querySelector('span').textContent = 'Copiar contexto';
        }
      }, 2000);
    }
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

init();
