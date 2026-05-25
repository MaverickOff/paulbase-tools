/**
 * @fileoverview Generador de Cronjobs - Vanilla JS (ES Modules)
 *
 * Construccion visual de expresiones cron estandar (5 campos).
 * Sin frameworks, sin innerHTML, sin eval, sin setTimeout con strings.
 */

// ==========================================
// CONSTANTES
// ==========================================

const DOW_NAMES = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
];

const MONTH_NAMES_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const FIELD_META = [
  { id: 'minute', label: 'Minuto', min: 0, max: 59, stepMax: 30 },
  { id: 'hour', label: 'Hora', min: 0, max: 23, stepMax: 12 },
  { id: 'dayOfMonth', label: 'Día del mes', min: 1, max: 31, stepMax: 15 },
  {
    id: 'month',
    label: 'Mes',
    min: 1,
    max: 12,
    stepMax: 6,
    names: [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ],
  },
  {
    id: 'dayOfWeek',
    label: 'Día de la semana',
    min: 0,
    max: 6,
    stepMax: 3,
    names: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  },
];

const PRESETS = [
  {
    label: 'Cada minuto',
    state: {
      minute: { mode: 'all', values: [], step: 1 },
      hour: { mode: 'all', values: [], step: 1 },
      dayOfMonth: { mode: 'all', values: [], step: 1 },
      month: { mode: 'all', values: [], step: 1 },
      dayOfWeek: { mode: 'all', values: [], step: 1 },
    },
  },
  {
    label: 'Cada 5 minutos',
    state: {
      minute: { mode: 'step', values: [], step: 5 },
      hour: { mode: 'all', values: [], step: 1 },
      dayOfMonth: { mode: 'all', values: [], step: 1 },
      month: { mode: 'all', values: [], step: 1 },
      dayOfWeek: { mode: 'all', values: [], step: 1 },
    },
  },
  {
    label: 'Cada 30 minutos',
    state: {
      minute: { mode: 'step', values: [], step: 30 },
      hour: { mode: 'all', values: [], step: 1 },
      dayOfMonth: { mode: 'all', values: [], step: 1 },
      month: { mode: 'all', values: [], step: 1 },
      dayOfWeek: { mode: 'all', values: [], step: 1 },
    },
  },
  {
    label: 'Cada hora',
    state: {
      minute: { mode: 'specific', values: [0], step: 1 },
      hour: { mode: 'all', values: [], step: 1 },
      dayOfMonth: { mode: 'all', values: [], step: 1 },
      month: { mode: 'all', values: [], step: 1 },
      dayOfWeek: { mode: 'all', values: [], step: 1 },
    },
  },
  {
    label: 'Diario (00:00)',
    state: {
      minute: { mode: 'specific', values: [0], step: 1 },
      hour: { mode: 'specific', values: [0], step: 1 },
      dayOfMonth: { mode: 'all', values: [], step: 1 },
      month: { mode: 'all', values: [], step: 1 },
      dayOfWeek: { mode: 'all', values: [], step: 1 },
    },
  },
  {
    label: 'Lun - Vie (09:00)',
    state: {
      minute: { mode: 'specific', values: [0], step: 1 },
      hour: { mode: 'specific', values: [9], step: 1 },
      dayOfMonth: { mode: 'all', values: [], step: 1 },
      month: { mode: 'all', values: [], step: 1 },
      dayOfWeek: { mode: 'specific', values: [1, 2, 3, 4, 5], step: 1 },
    },
  },
  {
    label: 'Semanal (Dom)',
    state: {
      minute: { mode: 'specific', values: [0], step: 1 },
      hour: { mode: 'specific', values: [0], step: 1 },
      dayOfMonth: { mode: 'all', values: [], step: 1 },
      month: { mode: 'all', values: [], step: 1 },
      dayOfWeek: { mode: 'specific', values: [0], step: 1 },
    },
  },
  {
    label: 'Mensual (1 00:00)',
    state: {
      minute: { mode: 'specific', values: [0], step: 1 },
      hour: { mode: 'specific', values: [0], step: 1 },
      dayOfMonth: { mode: 'specific', values: [1], step: 1 },
      month: { mode: 'all', values: [], step: 1 },
      dayOfWeek: { mode: 'all', values: [], step: 1 },
    },
  },
  {
    label: 'Anual (1 Ene 00:00)',
    state: {
      minute: { mode: 'specific', values: [0], step: 1 },
      hour: { mode: 'specific', values: [0], step: 1 },
      dayOfMonth: { mode: 'specific', values: [1], step: 1 },
      month: { mode: 'specific', values: [1], step: 1 },
      dayOfWeek: { mode: 'all', values: [], step: 1 },
    },
  },
  {
    label: 'Sabado (10:00)',
    state: {
      minute: { mode: 'specific', values: [0], step: 1 },
      hour: { mode: 'specific', values: [10], step: 1 },
      dayOfMonth: { mode: 'all', values: [], step: 1 },
      month: { mode: 'all', values: [], step: 1 },
      dayOfWeek: { mode: 'specific', values: [6], step: 1 },
    },
  },
];

// ==========================================
// UTILIDADES
// ==========================================

/** Crea elementos DOM de manera segura. */
function createEl(tag, opts) {
  opts = opts || {};
  const el = document.createElement(tag);
  if (opts.id) el.id = opts.id;
  if (opts.className) el.className = opts.className;
  if (opts.textContent !== undefined) el.textContent = opts.textContent;
  if (opts.type) el.type = opts.type;
  if (opts.value !== undefined) el.value = opts.value;
  if (opts.attrs)
    Object.entries(opts.attrs).forEach(function (entry) {
      el.setAttribute(entry[0], entry[1]);
    });
  if (opts.listeners)
    Object.entries(opts.listeners).forEach(function (entry) {
      el.addEventListener(entry[0], entry[1]);
    });
  return el;
}

function fmt(n) {
  return String(n).padStart(2, '0');
}

function isContiguous(arr) {
  if (arr.length < 2) return false;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] !== arr[i - 1] + 1) return false;
  }
  return true;
}

function humanize(indices, names) {
  if (indices.length === 0) return '';
  if (indices.length === 1)
    return names ? names[indices[0]] : String(indices[0]);
  if (isContiguous(indices)) {
    const first = names ? names[indices[0]] : String(indices[0]);
    const last = names
      ? names[indices[indices.length - 1]]
      : String(indices[indices.length - 1]);
    return 'de ' + first + ' a ' + last;
  }
  return indices
    .map(function (i) {
      return names ? names[i] : String(i);
    })
    .join(', ');
}

// ==========================================
// ESTADO
// ==========================================

let state = {};
const chipRefs = {};
let uiRefs = {};

// ==========================================
// LOGICA CRON
// ==========================================

function getFieldCron(id) {
  const s = state[id];
  if (s.mode === 'all') return '*';
  if (s.mode === 'step') return '*/' + s.step;
  if (s.mode === 'specific')
    return s.values.length ? s.values.join(',') : '*';
  return '*';
}

function getCronExpression() {
  return FIELD_META.map(function (f) {
    return getFieldCron(f.id);
  }).join(' ');
}

function getDescription() {
  const m = state.minute;
  const h = state.hour;
  const dm = state.dayOfMonth;
  const mo = state.month;
  const dw = state.dayOfWeek;

  if (
    m.mode === 'all' &&
    h.mode === 'all' &&
    dm.mode === 'all' &&
    mo.mode === 'all' &&
    dw.mode === 'all'
  )
    return 'Cada minuto';

  if (m.mode === 'step' && h.mode === 'all' && dm.mode === 'all' && mo.mode === 'all' && dw.mode === 'all')
    return m.step === 1 ? 'Cada minuto' : 'Cada ' + m.step + ' minutos';

  if (m.mode === 'specific' && m.values.length === 1 && m.values[0] === 0 && h.mode === 'all')
    return 'Cada hora en punto';

  if (m.mode === 'specific' && m.values.length === 1 && m.values[0] === 0 && h.mode === 'step')
    return h.step === 1 ? 'Cada hora en punto' : 'Cada ' + h.step + ' horas en punto';

  if (
    m.mode === 'specific' &&
    m.values.length === 1 &&
    h.mode === 'specific' &&
    h.values.length === 1 &&
    dm.mode === 'all' &&
    mo.mode === 'all' &&
    dw.mode === 'all'
  )
    return 'Todos los días a las ' + fmt(h.values[0]) + ':' + fmt(m.values[0]);

  if (
    m.mode === 'specific' &&
    m.values.length === 1 &&
    h.mode === 'specific' &&
    h.values.length === 1 &&
    dw.mode === 'specific' &&
    dm.mode === 'all' &&
    mo.mode === 'all'
  ) {
    const days = humanize(dw.values, DOW_NAMES);
    return (
      'Los ' + days + ' a las ' + fmt(h.values[0]) + ':' + fmt(m.values[0])
    );
  }

  if (
    m.mode === 'specific' &&
    m.values.length === 1 &&
    h.mode === 'specific' &&
    h.values.length === 1 &&
    dm.mode === 'specific' &&
    dm.values.length === 1 &&
    mo.mode === 'all' &&
    dw.mode === 'all'
  )
    return (
      'El dia ' +
      dm.values[0] +
      ' de cada mes a las ' +
      fmt(h.values[0]) +
      ':' +
      fmt(m.values[0])
    );

  if (
    m.mode === 'specific' &&
    m.values.length === 1 &&
    h.mode === 'specific' &&
    h.values.length === 1 &&
    dm.mode === 'specific' &&
    dm.values.length === 1 &&
    mo.mode === 'specific' &&
    mo.values.length === 1 &&
    dw.mode === 'all'
  )
    return (
      'El ' +
      dm.values[0] +
      ' de ' +
      MONTH_NAMES_ES[mo.values[0] - 1] +
      ' a las ' +
      fmt(h.values[0]) +
      ':' +
      fmt(m.values[0])
    );

  const parts = [];

  if (dw.mode === 'specific')
    parts.push('los ' + humanize(dw.values, DOW_NAMES));

  if (dm.mode === 'specific') {
    if (dm.values.length === 1) parts.push('el día ' + dm.values[0]);
    else parts.push('los días ' + dm.values.join(', '));
  }

  if (mo.mode === 'specific')
    parts.push('en ' + humanize(mo.values, MONTH_NAMES_ES));

  if (h.mode === 'specific') {
    if (m.mode === 'specific' && m.values.length === 1) {
      parts.push('a las ' + fmt(h.values[0]) + ':' + fmt(m.values[0]));
    } else {
      const hrList = h.values
        .map(function (v) {
          return fmt(v);
        })
        .join(', ');
      parts.push('a las ' + hrList + 'h');
    }
  } else if (h.mode === 'step') {
    parts.push('cada ' + h.step + ' horas');
  }

  if (m.mode === 'specific' && h.mode !== 'specific') {
    const minList = m.values
      .map(function (v) {
        return fmt(v);
      })
      .join(', ');
    parts.push('minuto ' + minList);
  } else if (m.mode === 'step') {
    parts.push('cada ' + m.step + ' minutos');
  }

  if (parts.length === 0) return 'Cada minuto';
  return parts.join(' ');
}

// ==========================================
// CONSTRUCCION DE LA UI
// ==========================================

function initApp() {
  const container = document.getElementById('cron-app');
  if (!container) return;
  while (container.firstChild) container.removeChild(container.firstChild);

  FIELD_META.forEach(function (f) {
    state[f.id] = { mode: 'all', values: [], step: 1 };
  });

  const wrapper = createEl('div', { className: 'cgt-wrapper' });
  container.appendChild(wrapper);

  wrapper.appendChild(buildHeader());
  wrapper.appendChild(buildPresetsCard());
  wrapper.appendChild(buildFieldsCard());
  wrapper.appendChild(buildOutputCard());

  updateAllControls();
  updateDisplay();
}

function buildHeader() {
  const header = createEl('div', { className: 'cgt-header' });
  header.appendChild(
    createEl('div', { className: 'cgt-header-icon', textContent: '⏰' })
  );
  header.appendChild(
    createEl('h1', {
      className: 'cgt-header-title',
      textContent: 'Generador de Cronjobs',
    })
  );
  header.appendChild(
    createEl('p', {
      className: 'cgt-header-desc',
      textContent:
        'Construye expresiones cron de forma visual. Selecciona cada componente para generar la sintaxis correcta y la descripción en español.',
    })
  );
  return header;
}

function buildPresetsCard() {
  const card = createEl('div', { className: 'cgt-card' });
  card.appendChild(
    createEl('div', {
      className: 'cgt-presets-title',
      textContent: 'Presets rápidos',
    })
  );
  const grid = createEl('div', { className: 'cgt-presets-grid' });

  PRESETS.forEach(function (preset, idx) {
    const btn = createEl('button', {
      type: 'button',
      className: 'cgt-preset-btn',
      textContent: preset.label,
      listeners: {
        click: function () {
          state = JSON.parse(JSON.stringify(preset.state));
          updateAllControls();
          updateDisplay();
        },
      },
    });
    grid.appendChild(btn);
  });

  card.appendChild(grid);
  return card;
}

function buildFieldsCard() {
  const card = createEl('div', { className: 'cgt-card' });
  const fieldsContainer = createEl('div', { className: 'cgt-fields' });
  card.appendChild(fieldsContainer);

  FIELD_META.forEach(function (fc) {
    const row = createEl('div', { className: 'cgt-field' });
    const label = createEl('div', {
      className: 'cgt-field-label',
      textContent: fc.label,
    });
    const controls = createEl('div', { className: 'cgt-field-controls' });

    const select = createEl('select', {
      className: 'cgt-field-select',
      attrs: { 'data-field': fc.id },
      listeners: {
        change: function (e) {
          state[fc.id].mode = e.target.value;
          if (state[fc.id].mode !== 'specific') state[fc.id].values = [];
          updateFieldVisibility(fc.id);
          updateDisplay();
        },
      },
    });

    const opts = [
      { v: 'all', t: 'Todos los valores (*)' },
      { v: 'specific', t: 'Especificar valores' },
      { v: 'step', t: 'Cada N (intervalo)' },
    ];
    opts.forEach(function (opt) {
      select.appendChild(
        createEl('option', { attrs: { value: opt.v }, textContent: opt.t })
      );
    });
    select.value = state[fc.id].mode;
    controls.appendChild(select);

    const chips = createEl('div', { className: 'cgt-chips' });
    chips.id = 'chips-' + fc.id;
    chipRefs[fc.id] = [];
    for (let i = fc.min; i <= fc.max; i++) {
      const btn = createEl('button', {
        type: 'button',
        className: 'cgt-chip',
        textContent: fc.names
          ? fc.names[i - fc.min]
          : String(i).padStart(2, '0'),
        listeners: {
          click: function () {
            const st = state[fc.id];
            const idx = st.values.indexOf(i);
            if (idx >= 0) {
              st.values.splice(idx, 1);
              btn.classList.remove('selected');
            } else {
              st.values.push(i);
              st.values.sort(function (a, b) {
                return a - b;
              });
              btn.classList.add('selected');
            }
            updateDisplay();
          },
        },
      });
      chips.appendChild(btn);
      chipRefs[fc.id].push(btn);
    }
    controls.appendChild(chips);

    const interval = createEl('div', { className: 'cgt-interval' });
    interval.id = 'interval-' + fc.id;
    interval.appendChild(
      createEl('span', {
        className: 'cgt-interval-label',
        textContent: 'Cada:',
      })
    );
    interval.appendChild(
      createEl('input', {
        type: 'number',
        className: 'cgt-interval-input',
        attrs: { min: 1, max: fc.stepMax, value: state[fc.id].step },
        listeners: {
          input: function (e) {
            let v = parseInt(e.target.value, 10);
            if (isNaN(v) || v < 1) v = 1;
            if (v > fc.stepMax) v = fc.stepMax;
            state[fc.id].step = v;
            updateDisplay();
          },
        },
      })
    );
    controls.appendChild(interval);

    row.appendChild(label);
    row.appendChild(controls);
    fieldsContainer.appendChild(row);
  });

  return card;
}

function buildOutputCard() {
  const card = createEl('div', { className: 'cgt-card cgt-output-section' });
  card.appendChild(
    createEl('div', {
      className: 'cgt-output-label',
      textContent: 'Expresión Cron',
    })
  );

  const exprWrap = createEl('div', { className: 'cgt-expression' });
  const code = createEl('div', {
    className: 'cgt-expression-code',
    textContent: '* * * * *',
  });
  const copyBtn = createEl('button', {
    type: 'button',
    className: 'cgt-copy-btn',
    textContent: 'Copiar',
    listeners: { click: copyToClipboard },
  });
  exprWrap.appendChild(code);
  exprWrap.appendChild(copyBtn);
  card.appendChild(exprWrap);

  const descBox = createEl('div', { className: 'cgt-description-box' });
  const descText = createEl('p', {
    className: 'cgt-description-text',
    textContent: 'Cada minuto',
  });
  descBox.appendChild(descText);
  card.appendChild(descBox);

  uiRefs = { expression: code, description: descText, copyBtn: copyBtn };
  return card;
}

// ==========================================
// SINCRONIZACION
// ==========================================

function updateFieldVisibility(fieldId) {
  const chips = document.getElementById('chips-' + fieldId);
  const interval = document.getElementById('interval-' + fieldId);
  const isSpecific = state[fieldId].mode === 'specific';
  const isStep = state[fieldId].mode === 'step';
  if (chips) chips.classList.toggle('visible', isSpecific);
  if (interval) interval.classList.toggle('visible', isStep);
}

function updateAllControls() {
  FIELD_META.forEach(function (fc) {
    const select = document.querySelector('.cgt-field-select[data-field="' + fc.id + '"]');
    if (select) select.value = state[fc.id].mode;

    const chips = chipRefs[fc.id];
    if (chips) {
      chips.forEach(function (el, idx) {
        const val = fc.min + idx;
        el.classList.toggle('selected', state[fc.id].values.indexOf(val) >= 0);
      });
    }

    const intervalDiv = document.getElementById('interval-' + fc.id);
    if (intervalDiv) {
      const input = intervalDiv.querySelector('input');
      if (input) input.value = state[fc.id].step;
    }

    updateFieldVisibility(fc.id);
  });
}

function updateDisplay() {
  if (uiRefs.expression) uiRefs.expression.textContent = getCronExpression();
  if (uiRefs.description) uiRefs.description.textContent = getDescription();
}

// ==========================================
// COPIADO
// ==========================================

async function copyToClipboard() {
  if (!uiRefs.copyBtn || !uiRefs.expression) return;
  try {
    await navigator.clipboard.writeText(uiRefs.expression.textContent);
    const originalText = uiRefs.copyBtn.textContent;

    uiRefs.copyBtn.textContent = 'Copiado';
    uiRefs.copyBtn.classList.add('copied');

    setTimeout(function () {
      if (uiRefs.copyBtn) {
        uiRefs.copyBtn.textContent = originalText;
        uiRefs.copyBtn.classList.remove('copied');
      }
    }, 2000);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error al copiar:', err);
  }
}

// ==========================================
// ARRANQUE
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
  initApp();
});
