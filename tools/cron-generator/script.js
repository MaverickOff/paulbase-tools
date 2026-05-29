/**
 * @fileoverview Generador de Cronjobs - Lógica con Vanilla JS
 *
 * Construcción visual de expresiones cron. Sin frameworks, sin innerHTML.
 * Usa exclusivamente document.createElement(), textContent y eventListeners.
 */

// ==========================================
// CONSTANTES DE CONFIGURACIÓN
// ==========================================

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const DOW_NAMES = [
  'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
];

/** @type {Array<{ id: string; label: string; min: number; max: number; names?: string[]; stepMax: number; gridCols?: number }>} */
const FIELD_CONFIG = [
  {
    id: 'minute',
    label: 'Minuto',
    min: 0,
    max: 59,
    stepMax: 30,
    gridCols: 10
  },
  {
    id: 'hour',
    label: 'Hora',
    min: 0,
    max: 23,
    stepMax: 12,
    gridCols: 8
  },
  {
    id: 'dayOfMonth',
    label: 'Día del mes',
    min: 1,
    max: 31,
    stepMax: 15,
    gridCols: 7
  },
  {
    id: 'month',
    label: 'Mes',
    min: 1,
    max: 12,
    names: MONTH_NAMES.map(m => m.charAt(0).toUpperCase() + m.slice(1, 3)),
    stepMax: 6,
    gridCols: 6
  },
  {
    id: 'dayOfWeek',
    label: 'Día de la semana',
    min: 0,
    max: 6,
    names: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    stepMax: 3,
    gridCols: 7
  }
];

/** @type {Array<{ label: string; state: Record<string, { mode: string; specific: number[]; step: number }> }>} */
const PRESETS = [
  {
    label: 'Cada minuto',
    state: {
      minute: { mode: '*', specific: [], step: 1 },
      hour: { mode: '*', specific: [], step: 1 },
      dayOfMonth: { mode: '*', specific: [], step: 1 },
      month: { mode: '*', specific: [], step: 1 },
      dayOfWeek: { mode: '*', specific: [], step: 1 }
    }
  },
  {
    label: 'Cada 5 minutos',
    state: {
      minute: { mode: 'step', specific: [], step: 5 },
      hour: { mode: '*', specific: [], step: 1 },
      dayOfMonth: { mode: '*', specific: [], step: 1 },
      month: { mode: '*', specific: [], step: 1 },
      dayOfWeek: { mode: '*', specific: [], step: 1 }
    }
  },
  {
    label: 'Cada 30 minutos',
    state: {
      minute: { mode: 'step', specific: [], step: 30 },
      hour: { mode: '*', specific: [], step: 1 },
      dayOfMonth: { mode: '*', specific: [], step: 1 },
      month: { mode: '*', specific: [], step: 1 },
      dayOfWeek: { mode: '*', specific: [], step: 1 }
    }
  },
  {
    label: 'Cada hora',
    state: {
      minute: { mode: 'specific', specific: [0], step: 1 },
      hour: { mode: '*', specific: [], step: 1 },
      dayOfMonth: { mode: '*', specific: [], step: 1 },
      month: { mode: '*', specific: [], step: 1 },
      dayOfWeek: { mode: '*', specific: [], step: 1 }
    }
  },
  {
    label: 'Diario (00:00)',
    state: {
      minute: { mode: 'specific', specific: [0], step: 1 },
      hour: { mode: 'specific', specific: [0], step: 1 },
      dayOfMonth: { mode: '*', specific: [], step: 1 },
      month: { mode: '*', specific: [], step: 1 },
      dayOfWeek: { mode: '*', specific: [], step: 1 }
    }
  },
  {
    label: 'Lun - Vie (09:00)',
    state: {
      minute: { mode: 'specific', specific: [0], step: 1 },
      hour: { mode: 'specific', specific: [9], step: 1 },
      dayOfMonth: { mode: '*', specific: [], step: 1 },
      month: { mode: '*', specific: [], step: 1 },
      dayOfWeek: { mode: 'specific', specific: [1, 2, 3, 4, 5], step: 1 }
    }
  },
  {
    label: 'Semanal (Dom 00:00)',
    state: {
      minute: { mode: 'specific', specific: [0], step: 1 },
      hour: { mode: 'specific', specific: [0], step: 1 },
      dayOfMonth: { mode: '*', specific: [], step: 1 },
      month: { mode: '*', specific: [], step: 1 },
      dayOfWeek: { mode: 'specific', specific: [0], step: 1 }
    }
  },
  {
    label: 'Mensual (1º 00:00)',
    state: {
      minute: { mode: 'specific', specific: [0], step: 1 },
      hour: { mode: 'specific', specific: [0], step: 1 },
      dayOfMonth: { mode: 'specific', specific: [1], step: 1 },
      month: { mode: '*', specific: [], step: 1 },
      dayOfWeek: { mode: '*', specific: [], step: 1 }
    }
  },
  {
    label: 'Anual (1° Ene 00:00)',
    state: {
      minute: { mode: 'specific', specific: [0], step: 1 },
      hour: { mode: 'specific', specific: [0], step: 1 },
      dayOfMonth: { mode: 'specific', specific: [1], step: 1 },
      month: { mode: 'specific', specific: [1], step: 1 },
      dayOfWeek: { mode: '*', specific: [], step: 1 }
    }
  },
  {
    label: 'Cada sábado (10:00)',
    state: {
      minute: { mode: 'specific', specific: [0], step: 1 },
      hour: { mode: 'specific', specific: [10], step: 1 },
      dayOfMonth: { mode: '*', specific: [], step: 1 },
      month: { mode: '*', specific: [], step: 1 },
      dayOfWeek: { mode: 'specific', specific: [6], step: 1 }
    }
  }
];

// ==========================================
// ESTADO GLOBAL
// ==========================================

/** @type {Record<string, { mode: string; specific: number[]; step: number }>} */
let state = {};

// Referencias a elementos DOM del output
/** @type {{ expression?: HTMLElement; description?: HTMLElement; copyBtn?: HTMLButtonElement }} */
let outputRefs = {};

// Referencias a chips (para sincronizar UI sin regenerar)
/** @type {Record<string, HTMLElement[]>} */
let chipRefs = {};

// ==========================================
// HELPERS DE DOM
// ==========================================

/**
 * Crea un elemento DOM con opciones. Nunca usa innerHTML.
 * @param {string} tag
 * @param {Object} options
 * @returns {HTMLElement}
 */
function createEl(tag, options = {}) {
  const el = document.createElement(tag);
  if (options.className) el.className = options.className;
  if (options.id) el.id = options.id;
  if (options.textContent) el.textContent = options.textContent;
  if (options.type) el.type = options.type;

  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, val]) => {
      el.setAttribute(key, String(val));
    });
  }

  if (options.listeners) {
    Object.entries(options.listeners).forEach(([event, handler]) => {
      el.addEventListener(event, handler);
    });
  }

  return el;
}

/**
 * Vacía un elemento padre de todos sus hijos.
 * @param {HTMLElement} parent
 */
function clearChildren(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

// ==========================================
// LÓGICA DE EXPRESIÓN Y TRADUCCIÓN
// ==========================================

/**
 * Obtiene la expresión cron para un campo y su estado.
 */
function getFieldExpression(fieldConfig, fieldState) {
  if (fieldState.mode === '*') {
    return '*';
  }
  if (fieldState.mode === 'step') {
    return `*/${fieldState.step}`;
  }
  if (fieldState.mode === 'specific') {
    if (fieldState.specific.length === 0) return '*';
    return fieldState.specific.join(',');
  }
  return '*';
}

/**
 * Genera la expresión cron completa a partir del estado actual.
 */
function buildCronExpression() {
  const parts = FIELD_CONFIG.map(fc => getFieldExpression(fc, state[fc.id]));
  return parts.join(' ');
}

/**
 * Traduce el estado actual a una descripción legible en español.
 */
function buildDescription() {
  const m = state.minute;
  const h = state.hour;
  const d = state.dayOfMonth;
  const mo = state.month;
  const w = state.dayOfWeek;

  // Comprobación: todo es *
  const allStar = m.mode === '*' && h.mode === '*' && d.mode === '*' && mo.mode === '*' && w.mode === '*';
  if (allStar) return 'Cada minuto';

  // Helper para formatear hora
  const fmtH = (v) => String(v).padStart(2, '0');

  // Parte temporal
  let timePart = '';
  let timeOnly = false;

  if (m.mode === 'step' && h.mode === '*') {
    if (m.step === 1) timePart = 'Cada minuto';
    else timePart = `Cada ${m.step} minutos`;
    if (d.mode !== '*' || mo.mode !== '*' || w.mode !== '*') {
      // Tiene componentes de fecha, sólo timePart base
    } else {
      timeOnly = true;
    }
  } else if (m.mode === 'specific' && m.specific.length === 1) {
    const mm = fmtH(m.specific[0]);
    if (h.mode === '*') {
      timePart = `Cada hora a los ${mm} minutos`;
      if (mm === '00') timePart = 'Cada hora en punto';
    } else if (h.mode === 'specific' && h.specific.length === 1) {
      const hh = fmtH(h.specific[0]);
      timePart = `a las ${hh}:${mm}`;
    } else if (h.mode === 'step') {
      const hh = fmtH(h.specific[0]);
      timePart = `a las ${hh}:${mm} cada ${h.step} horas`;
    }
  } else if (m.mode === 'specific' && m.specific.length > 1) {
    if (h.mode === 'specific' && h.specific.length === 1) {
      const mm = m.specific.map(fmtH).join(', ');
      const hh = fmtH(h.specific[0]);
      timePart = `a las ${hh}:${mm}`;
    } else {
      timePart = 'Programación personalizada';
    }
  } else if (h.mode === 'step') {
    const mm = m.mode === 'specific' && m.specific.length === 1 ? fmtH(m.specific[0]) : '00';
    timePart = `Cada ${h.step} horas a los ${mm} minutos`;
    if (mm === '00') {
      timePart = `Cada ${h.step} horas en punto`;
    }
  }

  // Parte de fecha
  let datePart = '';

  if (w.mode === 'specific' && w.specific.length > 0) {
    const names = w.specific.map(v => DOW_NAMES[v]);
    if (names.length === 1) {
      datePart = `Los ${names[0]}`;
    } else if (names.length === 7) {
      datePart = 'Todos los días';
    } else {
      datePart = `Los ${names.join(', ')}`;
    }
  } else if (d.mode === 'specific' && d.specific.length > 0) {
    if (mo.mode === 'specific' && mo.specific.length > 0) {
      // DOM + mes
      if (d.specific.length === 1 && mo.specific.length === 1) {
        const mName = MONTH_NAMES[mo.specific[0] - 1];
        datePart = `El ${d.specific[0]} de ${mName}`;
      } else if (d.specific.length === 1) {
        const mNames = mo.specific.map(v => MONTH_NAMES[v - 1]).join(', ');
        datePart = `El ${d.specific[0]} de ${mNames}`;
      } else {
        datePart = `Los días ${d.specific.join(', ')}`;
      }
    } else {
      if (d.specific.length === 1) {
        datePart = `El día ${d.specific[0]} de cada mes`;
      } else {
        datePart = `Los días ${d.specific.join(', ')} de cada mes`;
      }
    }
  } else if (mo.mode === 'specific' && mo.specific.length > 0) {
    if (mo.specific.length === 1) {
      datePart = `En ${MONTH_NAMES[mo.specific[0] - 1]}`;
    } else {
      const names = mo.specific.map(v => MONTH_NAMES[v - 1]);
      datePart = `En ${names.join(', ')}`;
    }
  } else if (d.mode === '*' && mo.mode === '*' && w.mode === '*') {
    datePart = 'Todos los días';
  }

  // Combinar
  if (timeOnly) return timePart;
  if (datePart && timePart) {
    if (timePart.startsWith('a las')) {
      return `${datePart} ${timePart}`;
    }
    if (timePart.startsWith('Cada')) {
      return `${datePart}, ${timePart}`;
    }
    return `${datePart}, ${timePart}`;
  }
  if (datePart) return datePart;
  if (timePart) return timePart;
  return 'Programación cron personalizada';
}

// ==========================================
// CONSTRUCCIÓN DE LA UI
// ==========================================

function initApp() {
  const container = document.getElementById('cron-app');
  if (!container) return;
  clearChildren(container);

  const wrapper = createEl('div', { className: 'cgt-wrapper' });
  container.appendChild(wrapper);

  initState();

  // Header
  const header = createEl('div', { className: 'cgt-header' });
  const title = createEl('h1', { className: 'cgt-header-title', textContent: 'Generador de Cronjobs' });
  const desc = createEl('p', { className: 'cgt-header-desc', textContent: 'Construye expresiones cron de forma visual. Selecciona cada componente para generar la sintaxis correcta y obtener una descripción legible en español.' });
  header.appendChild(createEl('div', { className: 'cgt-header-icon', textContent: '⏰' }));
  header.appendChild(title);
  header.appendChild(desc);
  wrapper.appendChild(header);

  // Presets
  wrapper.appendChild(buildPresetsCard());

  // Fields
  wrapper.appendChild(buildFieldsCard());

  // Output
  wrapper.appendChild(buildOutputCard());

  updateUI();
}

function initState() {
  state = {};
  FIELD_CONFIG.forEach(fc => {
    state[fc.id] = { mode: '*', specific: [], step: 1 };
  });
}

function buildPresetsCard() {
  const card = createEl('div', { className: 'cgt-card' });
  const label = createEl('div', { className: 'cgt-presets-title', textContent: 'Presets rápidos' });
  card.appendChild(label);

  const grid = createEl('div', { className: 'cgt-presets-grid' });

  PRESETS.forEach((preset, index) => {
    const btn = createEl('button', {
      type: 'button',
      className: 'cgt-preset-btn',
      textContent: preset.label,
      listeners: {
        click: () => {
          applyPreset(index);
          updateAllFieldUIs();
          updateUI();
        }
      }
    });
    grid.appendChild(btn);
  });

  card.appendChild(grid);
  return card;
}

function applyPreset(index) {
  const preset = PRESETS[index];
  if (!preset) return;
  state = JSON.parse(JSON.stringify(preset.state));
}

function buildFieldsCard() {
  const card = createEl('div', { className: 'cgt-card' });
  const container = createEl('div', { className: 'cgt-fields' });

  FIELD_CONFIG.forEach(fc => {
    const row = createEl('div', { className: 'cgt-field' });
    const label = createEl('div', { className: 'cgt-field-label', textContent: fc.label });

    const controls = createEl('div', { className: 'cgt-field-controls' });

    // Select de modo
    const select = createEl('select', {
      className: 'cgt-field-select',
      attrs: { 'data-field': fc.id },
      listeners: {
        change: (e) => {
          const newMode = e.target.value;
          state[fc.id].mode = newMode;
          // Al cambiar de modo, si no es 'specific', limpiar selección
          if (newMode !== 'specific') {
            state[fc.id].specific = [];
          }
          // Mostrar/ocultar subcontroles
          updateFieldControlVisibility(fc.id);
          updateUI();
        }
      }
    });

    const modes = [
      { value: '*', text: 'Todos los valores (*)' },
      { value: 'step', text: 'Cada N (intervalo)' },
      { value: 'specific', text: 'Especificar valores' }
    ];

    modes.forEach(m => {
      const opt = createEl('option', { attrs: { value: m.value }, textContent: m.text });
      select.appendChild(opt);
    });

    select.value = state[fc.id].mode;
    controls.appendChild(select);

    // Contenedor de chips (visible solo en modo 'specific')
    const chipsContainer = createEl('div', { className: 'cgt-chips' });
    chipsContainer.id = `chips-${fc.id}`;
    buildChips(fc, chipsContainer);
    controls.appendChild(chipsContainer);

    // Contenedor de intervalo (visible solo en modo 'step')
    const intervalContainer = createEl('div', { className: 'cgt-interval' });
    intervalContainer.id = `interval-${fc.id}`;
    buildInterval(fc, intervalContainer);
    controls.appendChild(intervalContainer);

    row.appendChild(label);
    row.appendChild(controls);
    container.appendChild(row);
  });

  card.appendChild(container);
  return card;
}

function buildChips(fieldConfig, container) {
  chipRefs[fieldConfig.id] = [];
  const { min, max, names } = fieldConfig;

  for (let i = min; i <= max; i++) {
    const btn = createEl('button', {
      type: 'button',
      className: 'cgt-chip',
      textContent: names ? names[i - min] : String(i).padStart(2, '0'),
      listeners: {
        click: () => {
          const st = state[fieldConfig.id];
          const val = i;
          const idx = st.specific.indexOf(val);
          if (idx >= 0) {
            st.specific.splice(idx, 1);
            btn.classList.remove('selected');
          } else {
            st.specific.push(val);
            st.specific.sort((a, b) => a - b);
            btn.classList.add('selected');
          }
          updateUI();
        }
      }
    });
    container.appendChild(btn);
    chipRefs[fieldConfig.id]?.push(btn);
  }
}

function buildInterval(fieldConfig, container) {
  const label = createEl('span', { className: 'cgt-interval-label', textContent: 'Cada:' });
  const input = createEl('input', {
    type: 'number',
    className: 'cgt-interval-input',
    attrs: {
      min: 1,
      max: fieldConfig.stepMax,
      value: state[fieldConfig.id].step || 1
    },
    listeners: {
      input: (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (val > fieldConfig.stepMax) val = fieldConfig.stepMax;
        state[fieldConfig.id].step = val;
        updateUI();
      }
    }
  });

  container.appendChild(label);
  container.appendChild(input);
}

function updateFieldControlVisibility(fieldId) {
  const chips = document.getElementById(`chips-${fieldId}`);
  const interval = document.getElementById(`interval-${fieldId}`);
  if (chips) chips.classList.toggle('visible', state[fieldId].mode === 'specific');
  if (interval) interval.classList.toggle('visible', state[fieldId].mode === 'step');
}

function updateAllFieldUIs() {
  FIELD_CONFIG.forEach(fc => {
    const select = document.querySelector(`.cgt-field-select[data-field="${fc.id}"]`);
    if (select) select.value = state[fc.id].mode;
    updateFieldControlVisibility(fc.id);
    updateChipsSelection(fc.id);
    updateIntervalValue(fc.id);
  });
}

function updateChipsSelection(fieldId) {
  const chips = chipRefs[fieldId];
  if (!chips) return;
  const selected = state[fieldId].specific;
  chips.forEach((chip, idx) => {
    const cfg = FIELD_CONFIG.find(f => f.id === fieldId);
    const val = cfg.min + idx;
    chip.classList.toggle('selected', selected.includes(val));
  });
}

function updateIntervalValue(fieldId) {
  const container = document.getElementById(`interval-${fieldId}`);
  if (!container) return;
  const input = container.querySelector('input');
  if (input) input.value = state[fieldId].step;
}

function buildOutputCard() {
  const card = createEl('div', { className: 'cgt-card cgt-output-section' });

  const label = createEl('div', { className: 'cgt-output-label', textContent: 'Expresión Cron' });
  card.appendChild(label);

  const expressionWrapper = createEl('div', { className: 'cgt-expression' });
  const code = createEl('div', { className: 'cgt-expression-code', textContent: '* * * * *' });
  const copyBtn = createEl('button', {
    type: 'button',
    className: 'cgt-copy-btn',
    textContent: 'Copiar',
    listeners: {
      click: () => copyToClipboard()
    }
  });
  expressionWrapper.appendChild(code);
  expressionWrapper.appendChild(copyBtn);
  card.appendChild(expressionWrapper);

  const descBox = createEl('div', { className: 'cgt-description-box' });
  const descText = createEl('p', { className: 'cgt-description-text', textContent: 'Cada minuto' });
  descBox.appendChild(descText);
  card.appendChild(descBox);

  outputRefs = { expression: code, description: descText, copyBtn };
  return card;
}

// ==========================================
// ACTUALIZACIÓN DE UI
// ==========================================

function updateUI() {
  const expr = buildCronExpression();
  const desc = buildDescription();

  if (outputRefs.expression) {
    outputRefs.expression.textContent = expr;
  }
  if (outputRefs.description) {
    outputRefs.description.textContent = desc;
  }
}

// ==========================================
// COPIAR AL PORTAPAPELES
// ==========================================

async function copyToClipboard() {
  const text = buildCronExpression();
  try {
    await navigator.clipboard.writeText(text);
    const originalText = outputRefs.copyBtn.textContent;
    outputRefs.copyBtn.textContent = 'Copiado';
    outputRefs.copyBtn.classList.add('copied');

    setTimeout(() => {
      outputRefs.copyBtn.textContent = originalText;
      outputRefs.copyBtn.classList.remove('copied');
    }, 2000);
  } catch (err) {
    // Fallback silent error
    console.error('Error al copiar:', err);
  }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});
