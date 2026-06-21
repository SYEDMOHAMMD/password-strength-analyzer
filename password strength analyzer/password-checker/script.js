// ─── Constants ────────────────────────────────────────────────────────────────
const COMMON = new Set([
  'password','123456','password123','admin','letmein','qwerty','abc123',
  'welcome','monkey','dragon','iloveyou','sunshine','princess','football',
  'shadow','master','hello','login','pass','test','root','toor','1234',
  '12345','123456789','111111','000000','superman','batman','charlie',
]);

// ─── State ────────────────────────────────────────────────────────────────────
let debounceTimer = null;
let lastAnalyzed  = '';
let aiCooldown    = false;

// ─── Utility ──────────────────────────────────────────────────────────────────
function calcEntropy(pw) {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/\d/.test(pw))    pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 32;
  if (pool === 0) return 0;
  return Math.round(pw.length * Math.log2(pool));
}

function crackTime(entropy) {
  const guesses = Math.pow(2, entropy);
  const rate    = 1e10; // 10 billion/sec (high-end GPU cluster)
  const secs    = guesses / rate;
  if (secs < 1)        return '< 1 sec';
  if (secs < 60)       return Math.round(secs) + ' secs';
  if (secs < 3600)     return Math.round(secs / 60) + ' mins';
  if (secs < 86400)    return Math.round(secs / 3600) + ' hrs';
  if (secs < 2.628e6)  return Math.round(secs / 86400) + ' days';
  if (secs < 3.154e7)  return Math.round(secs / 2.628e6) + ' months';
  if (secs < 3.154e9)  return Math.round(secs / 3.154e7) + ' years';
  if (secs < 3.154e12) return Math.round(secs / 3.154e9) + 'K years';
  return '> 1M years';
}

function setCheck(id, pass) {
  const el   = document.getElementById(id);
  const icon = el.querySelector('.icon');
  el.className = 'check ' + (pass ? 'pass' : 'fail');
  icon.textContent = pass ? '✓' : '✗';
}

// ─── Main analyze function ─────────────────────────────────────────────────────
function analyze() {
  const pw = document.getElementById('pwInput').value;

  if (!pw) { reset(); return; }

  // Criteria
  const hasUpper  = /[A-Z]/.test(pw);
  const hasLower  = /[a-z]/.test(pw);
  const hasNum    = /\d/.test(pw);
  const hasSym    = /[^a-zA-Z0-9]/.test(pw);
  const isLong    = pw.length >= 8;
  const notCommon = !COMMON.has(pw.toLowerCase());

  const passed = [isLong, hasUpper, hasLower, hasNum, hasSym, notCommon].filter(Boolean).length;
  const entropy = calcEntropy(pw);

  // Update checks
  setCheck('c-len',   isLong);
  setCheck('c-upper', hasUpper);
  setCheck('c-lower', hasLower);
  setCheck('c-num',   hasNum);
  setCheck('c-sym',   hasSym);
  setCheck('c-com',   notCommon);

  // Update stats
  document.getElementById('sLen').textContent   = pw.length;
  document.getElementById('sEnt').textContent   = entropy + ' bits';
  document.getElementById('sCrack').textContent = crackTime(entropy);

  // Entropy bar (max ~128 bits)
  document.getElementById('entropyFill').style.width = Math.min(100, Math.round(entropy / 128 * 100)) + '%';

  // Meter
  const pct   = Math.round((passed / 6) * 100);
  const fill  = document.getElementById('meterFill');
  const colors = ['#f85149','#f85149','#d29922','#d29922','#3fb950','#3fb950'];
  fill.style.width      = pct + '%';
  fill.style.background = colors[passed] || colors[0];

  // Labels
  const labels = ['Very Weak ⛔','Weak 🔴','Fair 🟠','Moderate 🟡','Strong 🟢','Excellent 💪'];
  document.getElementById('strengthLabel').textContent = labels[passed] || 'Very Weak';
  document.getElementById('strengthSub').textContent   = passed + '/6 checks passed';

  // Debounced AI call
  clearTimeout(debounceTimer);
  if (pw.length >= 4 && pw !== lastAnalyzed && !aiCooldown) {
    debounceTimer = setTimeout(() => callAI(pw, passed, entropy, hasUpper, hasLower, hasNum, hasSym, isLong, notCommon), 900);
  }
}

function reset() {
  ['c-len','c-upper','c-lower','c-num','c-sym','c-com'].forEach(id => {
    const el = document.getElementById(id);
    el.className = 'check';
    el.querySelector('.icon').textContent = '○';
  });
  document.getElementById('meterFill').style.width      = '0%';
  document.getElementById('strengthLabel').textContent  = 'Enter a password';
  document.getElementById('strengthSub').textContent    = '';
  document.getElementById('sLen').textContent           = '0';
  document.getElementById('sEnt').textContent           = '0 bits';
  document.getElementById('sCrack').textContent         = '—';
  document.getElementById('entropyFill').style.width    = '0%';
  document.getElementById('aiText').textContent         = 'Start typing to get personalized feedback from Claude AI.';
  document.getElementById('suggestBox').style.display   = 'none';
}

// ─── Toggle visibility ────────────────────────────────────────────────────────
function toggleVis() {
  const inp = document.getElementById('pwInput');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

// ─── Claude AI call ───────────────────────────────────────────────────────────
function callAI(pw, passed, entropy, hasUpper, hasLower, hasNum, hasSym, isLong, notCommon) {
  lastAnalyzed  = pw;
  aiCooldown    = true;
  setTimeout(() => aiCooldown = false, 4000);

  const masked = pw[0] + '*'.repeat(Math.max(0, pw.length - 2)) + (pw.length > 1 ? pw[pw.length - 1] : '');
  const aiText = document.getElementById('aiText');

  document.getElementById('aiSpinner').style.display = 'inline-block';
  document.getElementById('suggestBox').style.display = 'none';
  aiText.textContent = 'Analyzing with Claude AI...';

  const prompt =
    'You are a cybersecurity expert coaching a user on password security.\n\n' +
    'Password info (masked for privacy): "' + masked + '"\n' +
    'Length: ' + pw.length + ' chars | Entropy: ' + entropy + ' bits\n' +
    'Checks passed: ' + passed + '/6\n' +
    'What is missing: ' +
    (!isLong    ? 'too short. '   : '') +
    (!hasUpper  ? 'no uppercase. ': '') +
    (!hasLower  ? 'no lowercase. ': '') +
    (!hasNum    ? 'no numbers. '  : '') +
    (!hasSym    ? 'no symbols. '  : '') +
    (!notCommon ? 'it is a very common password. ' : '') +
    '\n\n' +
    'Write exactly 2 sentences of specific coaching based on what is missing. ' +
    'Then on a new line write exactly: SUGGEST: followed by one strong memorable password example ' +
    '(passphrase style, e.g. "Coffee#Mango77!" or "BlueSky!Rain&42") that fixes the weaknesses.\n\n' +
    'No markdown. No bullet points. Plain text only.';

  fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  .then(r => r.json())
  .then(data => {
    document.getElementById('aiSpinner').style.display = 'none';
    const full  = data.content?.[0]?.text || '';
    const parts = full.split(/SUGGEST:/i);
    const tip   = parts[0].trim();
    const sug   = (parts[1] || '').trim();

    aiText.textContent = tip || 'Keep working on strengthening your password!';
    if (sug) {
      document.getElementById('suggestPw').textContent    = sug;
      document.getElementById('suggestBox').style.display = 'block';
    }
  })
  .catch(() => {
    document.getElementById('aiSpinner').style.display = 'none';
    aiText.textContent = 'AI coaching unavailable. Check your internet connection.';
  });
}

// ─── Copy suggestion ──────────────────────────────────────────────────────────
function copySuggestion() {
  const pw  = document.getElementById('suggestPw').textContent;
  const box = document.getElementById('suggestPw');
  navigator.clipboard.writeText(pw).then(() => {
    box.textContent = '✓ Copied to clipboard!';
    setTimeout(() => box.textContent = pw, 1500);
  }).catch(() => {
    box.textContent = 'Select and copy manually: ' + pw;
  });
}
