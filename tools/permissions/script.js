/**
 * Linux Permissions Visual Translator
 * Two-way binding: octal <-> symbolic <-> visual toggles
 * Zero external dependencies. Vanilla JS ES Modules.
 */

// ==========================================================================
// State
// ==========================================================================

const state = {
  owner: { read: false, write: false, execute: false },
  group: { read: false, write: false, execute: false },
  public: { read: false, write: false, execute: false },
};

// Regex patterns for input validation
const OCTAL_REGEX = /^[0-7]{3}$/;
const SYMBOLIC_REGEX = /^[r\-][w\-][x\-][r\-][w\-][x\-][r\-][w\-][x\-]$/;

// Group IDs matching data-group attributes
const GROUPS = ['owner', 'group', 'public'];
const PERMS = ['read', 'write', 'execute'];

// ==========================================================================
// Conversion: State -> Octal / Symbolic
// ==========================================================================

/** Calculates the octal digit (0-7) for a single permission group */
function groupToOctal(group) {
  let value = 0;
  if (group.read) value += 4;
  if (group.write) value += 2;
  if (group.execute) value += 1;
  return value;
}

/** Converts a single permission group to its 3-char symbolic string */
function groupToSymbolic(group) {
  return (
    (group.read ? 'r' : '-') +
    (group.write ? 'w' : '-') +
    (group.execute ? 'x' : '-')
  );
}

/** Returns the full octal string from state (e.g. "755") */
function stateToOctal() {
  return GROUPS.map((g) => groupToOctal(state[g])).join('');
}

/** Returns the full symbolic string from state (e.g. "rwxr-xr-x") */
function stateToSymbolic() {
  return GROUPS.map((g) => groupToSymbolic(state[g])).join('');
}

// ==========================================================================
// Conversion: Octal / Symbolic -> State
// ==========================================================================

/** Parses a single octal digit (0-7) into a permission group object */
function octalDigitToGroup(digit) {
  const val = parseInt(digit, 10);
  return {
    read: (val & 4) !== 0,
    write: (val & 2) !== 0,
    execute: (val & 1) !== 0,
  };
}

/** Parses a 3-char symbolic substring into a permission group object */
function symbolicTripletToGroup(triplet) {
  return {
    read: triplet[0] === 'r',
    write: triplet[1] === 'w',
    execute: triplet[2] === 'x',
  };
}

/** Loads an octal string (e.g. "755") into state */
function loadOctalIntoState(octal) {
  for (let i = 0; i < 3; i++) {
    state[GROUPS[i]] = octalDigitToGroup(octal[i]);
  }
}

/** Loads a symbolic string (e.g. "rwxr-xr-x") into state */
function loadSymbolicIntoState(symbolic) {
  for (let i = 0; i < 3; i++) {
    state[GROUPS[i]] = symbolicTripletToGroup(symbolic.substring(i * 3, i * 3 + 3));
  }
}

// ==========================================================================
// DOM Sync: State -> UI
// ==========================================================================

/** Syncs all UI elements from the current state */
function syncUIFromState(source) {
  // Update toggles
  const toggles = document.querySelectorAll('.lpt-toggle');
  toggles.forEach((toggle) => {
    const group = toggle.dataset.group;
    const perm = toggle.dataset.perm;
    const active = state[group][perm];
    toggle.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  // Update group values
  const ownerValueEl = document.getElementById('ownerValue');
  const groupValueEl = document.getElementById('groupValue');
  const publicValueEl = document.getElementById('publicValue');

  if (ownerValueEl) ownerValueEl.textContent = groupToOctal(state.owner);
  if (groupValueEl) groupValueEl.textContent = groupToOctal(state.group);
  if (publicValueEl) publicValueEl.textContent = groupToOctal(state.public);

  // Update text inputs (avoid overwriting the field the user is typing in)
  const octalInput = document.getElementById('lptOctalInput');
  const symbolicInput = document.getElementById('lptSymbolicInput');

  if (source !== 'octal' && octalInput) {
    octalInput.value = stateToOctal();
  }
  if (source !== 'symbolic' && symbolicInput) {
    symbolicInput.value = stateToSymbolic();
  }

  // Update chmod command
  const chmodEl = document.getElementById('lptChmodCommand');
  if (chmodEl) {
    chmodEl.textContent = 'chmod ' + stateToOctal();
  }
}

// ==========================================================================
// Event Handlers
// ==========================================================================

/** Handles toggle button clicks */
function handleToggleClick(event) {
  const toggle = event.target.closest('.lpt-toggle');
  if (!toggle) return;

  const group = toggle.dataset.group;
  const perm = toggle.dataset.perm;

  // Flip the permission
  state[group][perm] = !state[group][perm];

  syncUIFromState('toggle');
}

/** Handles octal input changes (event: 'input') */
function handleOctalInput(event) {
  const raw = event.target.value;

  // Filter non-digit characters as user types
  const filtered = raw.replace(/[^0-7]/g, '');
  if (filtered !== raw) {
    event.target.value = filtered;
  }

  // Only process when we have exactly 3 valid octal digits
  if (OCTAL_REGEX.test(filtered)) {
    loadOctalIntoState(filtered);
    syncUIFromState('octal');
  }
}

/** Handles symbolic input changes (event: 'input') */
function handleSymbolicInput(event) {
  const raw = event.target.value;

  // Normalize: replace invalid chars with dashes
  const normalized = raw
    .split('')
    .map((ch, i) => {
      const pos = i % 3;
      const validChars = pos === 0 ? ['r', '-'] : pos === 1 ? ['w', '-'] : ['x', '-'];
      return validChars.includes(ch) ? ch : '-';
    })
    .join('')
    .substring(0, 9);

  if (normalized !== raw) {
    event.target.value = normalized;
  }

  // Only process when we have exactly 9 valid chars
  if (SYMBOLIC_REGEX.test(normalized)) {
    loadSymbolicIntoState(normalized);
    syncUIFromState('symbolic');
  }
}

/** Handles octal input blur — reformat if partially filled */
function handleOctalBlur(event) {
  const raw = event.target.value;
  if (raw.length > 0 && raw.length < 3) {
    // Pad with leading zeros
    const padded = raw.padStart(3, '0');
    if (OCTAL_REGEX.test(padded)) {
      event.target.value = padded;
      loadOctalIntoState(padded);
      syncUIFromState('octal');
    }
  }
}

/** Handles symbolic input blur -- reformat if partially filled */
function handleSymbolicBlur(event) {
  const raw = event.target.value;
  if (raw.length > 0 && raw.length < 9) {
    // Pad with dashes to make 9 chars
    const padded = raw.padEnd(9, '-');
    if (SYMBOLIC_REGEX.test(padded)) {
      event.target.value = padded;
      loadSymbolicIntoState(padded);
      syncUIFromState('symbolic');
    }
  }
}

/** Handles preset button clicks */
function handlePresetClick(event) {
  const btn = event.target.closest('.lpt-preset-btn');
  if (!btn) return;

  const octal = btn.dataset.octal;
  if (!OCTAL_REGEX.test(octal)) return;

  loadOctalIntoState(octal);
  syncUIFromState('preset');
}

// ==========================================================================
// Clipboard
// ==========================================================================

/** Copies text to clipboard with visual feedback */
async function copyToClipboard(text, button) {
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    showCopyFeedback(button);
  } catch (err) {
    // Clipboard API not available
    console.error('Clipboard API error:', err);
  }
}

/** Shows temporary visual feedback on a copy button */
function showCopyFeedback(button) {
  if (!button) return;

  button.classList.add('copied');

  // Swap icon to checkmark
  const svg = button.querySelector('svg');
  if (svg) {
    svg.setAttribute('data-original-content', svg.innerHTML);
    svg.innerHTML = '<path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>';
  }

  setTimeout(() => {
    button.classList.remove('copied');

    if (svg && svg.getAttribute('data-original-content')) {
      svg.innerHTML = svg.getAttribute('data-original-content');
      svg.removeAttribute('data-original-content');
    }
  }, 2000);
}

/** Handles copy button clicks via delegation */
function handleCopyClick(event) {
  const btn = event.target.closest('[data-copy-target]');
  if (!btn) return;

  const targetId = btn.getAttribute('data-copy-target');
  const copyType = btn.getAttribute('data-copy-type');

  // For elements that use textContent instead of .value (like chmod command)
  if (copyType === 'text') {
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;
    copyToClipboard(targetEl.textContent, btn);
  } else {
    const targetInput = document.getElementById(targetId);
    if (!targetInput) return;
    copyToClipboard(targetInput.value, btn);
  }
}

// ==========================================================================
// Initialization
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Attach toggle listeners via delegation on the matrix container
  const matrix = document.querySelector('.lpt-matrix');
  if (matrix) {
    matrix.addEventListener('click', handleToggleClick);
  }

  // Octal input
  const octalInput = document.getElementById('lptOctalInput');
  if (octalInput) {
    octalInput.addEventListener('input', handleOctalInput);
    octalInput.addEventListener('blur', handleOctalBlur);
  }

  // Symbolic input
  const symbolicInput = document.getElementById('lptSymbolicInput');
  if (symbolicInput) {
    symbolicInput.addEventListener('input', handleSymbolicInput);
    symbolicInput.addEventListener('blur', handleSymbolicBlur);
  }

  // Preset buttons via delegation
  const presetsContainer = document.querySelector('.lpt-presets');
  if (presetsContainer) {
    presetsContainer.addEventListener('click', handlePresetClick);
  }

  // Copy buttons via delegation on the whole document
  document.addEventListener('click', handleCopyClick);

  // Set initial state to 000 (everything is already false)
  syncUIFromState('init');
});
