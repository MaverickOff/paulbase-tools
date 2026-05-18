/**
 * Password & Hash Generator
 * Security: Uses crypto.getRandomValues() for password entropy
 *           and crypto.subtle.digest() for hash generation.
 * Zero external dependencies.
 */

// ==========================================================================
// Character sets
// ==========================================================================
const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

// ==========================================================================
// Password Generator
// ==========================================================================

/**
 * Generates a cryptographically secure random password using
 * window.crypto.getRandomValues(). Never uses Math.random().
 *
 * @param {number} length - Desired password length (8-64)
 * @param {Object} options - Charset toggles { uppercase, lowercase, numbers, symbols }
 * @returns {string} The generated password
 */
function generateSecurePassword(length, options) {
  const charset = buildCharset(options);

  if (charset.length === 0) {
    return '';
  }

  const charsetArray = Array.from(charset);
  const result = new Array(length);
  const maxValid = Math.floor(0x100000000 / charsetArray.length) * charsetArray.length;

  for (let i = 0; i < length; i++) {
    let randomValue;
    let randomIndex;

    do {
      const randomBytes = new Uint32Array(1);
      window.crypto.getRandomValues(randomBytes);
      randomValue = randomBytes[0];
      randomIndex = randomValue % charsetArray.length;
    } while (randomValue >= maxValid);

    result[i] = charsetArray[randomIndex];
  }

  return result.join('');
}

/**
 * Builds the active charset string from selected options.
 *
 * @param {Object} options
 * @returns {string} Combined character set
 */
function buildCharset(options) {
  let charset = '';
  if (options.uppercase) charset += CHAR_SETS.uppercase;
  if (options.lowercase) charset += CHAR_SETS.lowercase;
  if (options.numbers) charset += CHAR_SETS.numbers;
  if (options.symbols) charset += CHAR_SETS.symbols;
  return charset;
}

// ==========================================================================
// Hash Generator (Web Crypto API)
// ==========================================================================

/**
 * Computes a hash using the Web Crypto API (crypto.subtle.digest).
 *
 * @param {string} algorithm - Hash algorithm name (e.g., 'SHA-1', 'SHA-256', 'SHA-512')
 * @param {string} text - Text to hash
 * @returns {Promise<string>} Hexadecimal hash string
 */
async function computeHash(algorithm, text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest(algorithm, data);
  return bufferToHex(hashBuffer);
}

/**
 * Converts an ArrayBuffer to a lowercase hexadecimal string.
 *
 * @param {ArrayBuffer} buffer
 * @returns {string} Hex string
 */
function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

// ==========================================================================
// Clipboard Utilities
// ==========================================================================

/**
 * Copies text to clipboard with visual feedback on the button.
 * Uses only the native Clipboard API. No execCommand fallback.
 *
 * @param {string} text - Text to copy
 * @param {HTMLElement} button - Button element for feedback
 */
async function copyToClipboard(text, button) {
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    showCopyFeedback(button);
  } catch (err) {
    console.error('Clipboard API error:', err);
  }
}

/**
 * Shows temporary visual feedback on a copy button.
 *
 * @param {HTMLElement} button
 */
function showCopyFeedback(button) {
  if (!button) return;

  const originalHTML = button.innerHTML;
  const originalText = button.querySelector('.pht-copy-text');

  button.classList.add('copied');

  // Save whether the button had a text label
  const hadText = !!originalText;

  if (hadText) {
    button.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <span class="pht-copy-text">Copiado</span>
    `;
  } else {
    button.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    `;
  }

  setTimeout(() => {
    button.classList.remove('copied');
    button.innerHTML = originalHTML;
  }, 2000);
}

// ==========================================================================
// Debounce utility for real-time hash updates
// ==========================================================================

/** @type {Map<string, number>} */
const debounceTimers = new Map();

/**
 * Debounces a function call.
 *
 * @param {string} key - Unique key for the timer
 * @param {Function} fn - Function to execute
 * @param {number} delay - Delay in milliseconds
 */
function debounce(key, fn, delay = 250) {
  if (debounceTimers.has(key)) {
    clearTimeout(debounceTimers.get(key));
  }
  const timer = setTimeout(() => {
    fn();
    debounceTimers.delete(key);
  }, delay);
  debounceTimers.set(key, timer);
}

// ==========================================================================
// DOM Event Wiring
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------
  // Elements: Password Generator
  // --------------------------------------------------------------------
  const passwordOutput = document.getElementById('passwordOutput');
  const passwordLength = document.getElementById('passwordLength');
  const lengthNumber = document.getElementById('lengthNumber');
  const lengthValue = document.getElementById('lengthValue');
  const useUppercase = document.getElementById('useUppercase');
  const useLowercase = document.getElementById('useLowercase');
  const useNumbers = document.getElementById('useNumbers');
  const useSymbols = document.getElementById('useSymbols');
  const generateBtn = document.getElementById('generateBtn');

  // --------------------------------------------------------------------
  // Elements: Hash Generator
  // --------------------------------------------------------------------
  const hashInput = document.getElementById('hashInput');
  const sha1Output = document.getElementById('sha1Output');
  const sha256Output = document.getElementById('sha256Output');
  const sha512Output = document.getElementById('sha512Output');

  // --------------------------------------------------------------------
  // Password: Sync length slider <-> number input
  // --------------------------------------------------------------------
  function syncLength(value) {
    const val = Math.min(64, Math.max(8, parseInt(value, 10) || 8));
    passwordLength.value = val;
    lengthNumber.value = val;
    if (lengthValue) lengthValue.textContent = val;
    return val;
  }

  passwordLength.addEventListener('input', (e) => {
    syncLength(e.target.value);
  });

  lengthNumber.addEventListener('input', (e) => {
    syncLength(e.target.value);
  });

  lengthNumber.addEventListener('blur', (e) => {
    syncLength(e.target.value);
  });

  // --------------------------------------------------------------------
  // Password: Gather options from checkboxes
  // --------------------------------------------------------------------
  function getPasswordOptions() {
    return {
      uppercase: useUppercase.checked,
      lowercase: useLowercase.checked,
      numbers: useNumbers.checked,
      symbols: useSymbols.checked,
    };
  }

  // --------------------------------------------------------------------
  // Password: Generate on button click
  // --------------------------------------------------------------------
  generateBtn.addEventListener('click', () => {
    const options = getPasswordOptions();
    const length = parseInt(passwordLength.value, 10);
    const password = generateSecurePassword(length, options);
    passwordOutput.value = password;
  });

  // --------------------------------------------------------------------
  // Password: Validate at least one option is selected
  // --------------------------------------------------------------------
  const optionCheckboxes = [useUppercase, useLowercase, useNumbers, useSymbols];
  optionCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const checked = optionCheckboxes.filter((cb) => cb.checked);
      if (checked.length === 0) {
        // Prevent unchecking the last option
        checkbox.checked = true;
      }
      // Auto-generate new password when options change
      const options = getPasswordOptions();
      const length = parseInt(passwordLength.value, 10);
      passwordOutput.value = generateSecurePassword(length, options);
    });
  });

  // --------------------------------------------------------------------
  // Hash: Real-time update on input
  // --------------------------------------------------------------------
  async function updateHashes() {
    const text = hashInput.value;

    if (text.length === 0) {
      sha1Output.value = '';
      sha256Output.value = '';
      sha512Output.value = '';
      return;
    }

    try {
      const [sha1, sha256, sha512] = await Promise.all([
        computeHash('SHA-1', text),
        computeHash('SHA-256', text),
        computeHash('SHA-512', text),
      ]);

      sha1Output.value = sha1;
      sha256Output.value = sha256;
      sha512Output.value = sha512;
    } catch (err) {
      //eslint-disable-next-line no-console
      console.error('Hash computation error:', err);
    }
  }

  hashInput.addEventListener('input', () => {
    debounce('hashUpdate', updateHashes, 200);
  });

  // --------------------------------------------------------------------
  // Copy buttons: event delegation
  // --------------------------------------------------------------------
  document.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('[data-copy-target]');
    if (!copyBtn) return;

    const targetId = copyBtn.getAttribute('data-copy-target');
    const targetInput = document.getElementById(targetId);
    if (!targetInput) return;

    copyToClipboard(targetInput.value, copyBtn);
  });

  // --------------------------------------------------------------------
  // SHA-1 Insecure Badge
  // --------------------------------------------------------------------
  const sha1ResultItem = document.getElementById('sha1Output').closest('.pht-hash-result-item');
  if (sha1ResultItem) {
    const sha1Label = sha1ResultItem.querySelector('.pht-hash-label');
    if (sha1Label) {
      const insecureBadge = document.createElement('span');
      insecureBadge.className = 'pht-insecure-badge';
      insecureBadge.textContent = ' (Inseguro / Obsoleto)';
      insecureBadge.style.color = '#ef4444';
      insecureBadge.style.fontSize = '0.75rem';
      insecureBadge.style.marginLeft = '0.5rem';
      const hashName = sha1Label.querySelector('.pht-hash-name');
      if (hashName) {
        hashName.appendChild(insecureBadge);
      }
    }
  }

  // --------------------------------------------------------------------
  // Initial generation
  // --------------------------------------------------------------------
  passwordOutput.value = generateSecurePassword(16, getPasswordOptions());
});
