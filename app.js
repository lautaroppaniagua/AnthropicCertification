var GITHUB_URL = 'https://github.com/TODO/AnthropicCertification';

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
  var indexed = q.options.map(function(text, i) {
    return { text: text, isCorrect: q.correct.indexOf(i) !== -1 };
  });
  var shuffled = shuffle(indexed);
  var newCorrect = [];
  shuffled.forEach(function(item, i) {
    if (item.isCorrect) newCorrect.push(i);
  });
  return Object.assign({}, q, {
    options: shuffled.map(function(o) { return o.text; }),
    correct: newCorrect
  });
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

function officialBadge(q) {
  if (q.official) {
    return '<span class="badge badge-official">✓ Pregunta oficial</span>';
  }
  return '<span class="badge badge-experimental">⚠ Pregunta experimental</span>';
}

function init() {
  initTheme();
  state.questions = shuffle(QUESTIONS).map(shuffleQuestionOptions);
  renderStart();
}

function startExam() {
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

  var pct = Math.round((score / state.questions.length) * 100);
  var pass = pct >= 70;

  document.getElementById('app').innerHTML =
    '<div class="results-screen">' +
      '<div class="results-card">' +
        '<div class="start-theme-row">' + themeToggleBtn() + '</div>' +
        '<h2>Resultado final</h2>' +
        '<div class="score-display">' +
          '<span class="score-number">' + score + '</span>' +
          '<span class="score-divider">/</span>' +
          '<span class="score-total">' + state.questions.length + '</span>' +
        '</div>' +
        '<p class="score-percent">' + pct + '% correcto</p>' +
        '<span class="score-pass-label ' + (pass ? 'pass' : 'fail') + '">' +
          (pass ? '✓ Aprobado' : '✗ A seguir estudiando') +
        '</span>' +
        '<p class="time-taken">Tiempo: ' + formatTime(elapsed) + '</p>' +
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
        '<button class="btn-primary" onclick="startExam()">Comenzar examen</button>' +
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

  var allConfirmed = confirmed === total;
  var footerCenter;
  if (allConfirmed) {
    footerCenter = '<button class="btn-finish" onclick="showResults()">Ver resultados</button>';
  } else {
    footerCenter = '<span class="confirmed-count">' + confirmed + '/' + total + ' confirmadas</span>';
  }

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
          officialBadge(q) +
          '<h2 class="question-text">' + escapeHtml(q.question) + '</h2>' +
          '<div class="options-list">' + optionsHtml + '</div>' +
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

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

init();
