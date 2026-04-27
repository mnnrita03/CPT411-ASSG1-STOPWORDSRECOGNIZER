/*
    1. Hardcoded DFA transition table
        Format: DELTA[stateName][charLabel] = nextStateName
        'others' = any char not explicitly listed from that state
        Trap states (q32,q33,q34,q35,q36,q37) loop on 'others'.
*/

const DELTA = {
  // start state
  'q0':  { 'a':'q1',  'b':'q16', 'h':'q22', 'i':'q28', 'm':'q26',
           'o':'q13', 's':'q24', 't':'q8',  'u':'q18', 'w':'q20',
           'others':'q32' }, 

  // a-branch
  'q1':  { 'n':'q5',  't':'q7',  'r':'q2',  's':'q4',  'others':'q33' },
  'q2':  { 'e':'q3',  'others':'q33' },
  'q3':  { 'others':'q33' },   
  'q4':  { 'others':'q33' },   
  'q5':  { 'd':'q6',  'others':'q33' },
  'q6':  { 'others':'q33' },  
  'q7':  { 'others':'q34' }, 

  //  i-branch 
  'q28': { 'f':'q31', 'n':'q25', 't':'q30', 's':'q29', 'others':'q32' },
  'q30': { 's':'q31', 'others':'q32' },   // ✓ "it"  → q30;  "its" → q31
  'q31': { 'others':'q32' },              // ✓ "if" / "its"
  'q29': { 'others':'q32' },              // ✓ "is" — not in list; boundary rejects
  'q25': { 'others':'q32' },              // ✓ "in" / "my" end / "so" end

  // t-branch 
  'q8':  { 'o':'q7',  'h':'q9',  'others':'q34' },
  'q9':  { 'e':'q10', 'others':'q34' },
  'q10': { 'y':'q11', 'm':'q12', 'others':'q34' },
  'q11': { 'others':'q34' },   // ✓ "they"
  'q12': { 'others':'q34' },   // ✓ "them"

  // h-branch
  'q22': { 'e':'q23', 'others':'q37' },
  'q23': { 'others':'q37' },   // ✓ "he" / "she" end / "the" end → same state

  // s-branch 
  'q24': { 'o':'q25', 'h':'q22', 'others':'q37' },

  // o-branch 
  'q13': { 'r':'q14', 'f':'q12', 'n':'q15', 'others':'q35' },
  'q14': { 'others':'q35' },   
  'q15': { 'others':'q35' },   

  // b-branch 
  'q16': { 'y':'q15', 'u':'q17', 'others':'q36' },
  'q17': { 't':'q15', 'others':'q35' },

  // u-branch 
  'q18': { 's':'q19', 'others':'q36' },
  'q19': { 'others':'q36' },   

  // w-branch 
  'q20': { 'e':'q21', 'a':'q18', 'others':'q36' },
  'q21': { 'r':'q22', 'others':'q36' },   

  // m-branch 
  'q26': { 'e':'q27', 'y':'q25', 'others':'q37' },
  'q27': { 'others':'q37' },   

  // trap states (loop on everything) 
  'q32': { 'others':'q32' },
  'q33': { 'others':'q33' },
  'q34': { 'others':'q34' },
  'q35': { 'others':'q35' },
  'q36': { 'others':'q36' },
  'q37': { 'others':'q37' },
};

// Accept states
const ACCEPT_STATES = {
  'q1':true,'q3':true,'q4':true,'q5':true,'q6':true,'q7':true,
  'q10':true,'q11':true,'q12':true,'q14':true,'q15':true,
  'q19':true,'q21':true,'q23':true,'q25':true,'q27':true,
  'q28':true,'q29':true,'q30':true,'q31':true
};

// The valid stop words — used only for boundary acceptance check (1- true)
const STOP_SET = {
  'a':1,'an':1,'and':1,'at':1,
  'by':1,'but':1,
  'he':1,
  'i':1,'if':1,'in':1,'it':1,'its':1,
  'me':1,'my':1,
  'of':1,'on':1,'or':1,
  'she':1,'so':1,
  'the':1,'them':1,'they':1,'to':1,
  'us':1,
  'we':1,
  'is':1,'are':1,'was':1,'were':1,'as':1
};

/* Stop word categories for highlighting */
const STOP_WORD_CATEGORIES = {
  // 1. Articles (Determiners)
  'a': 'articles',
  'an': 'articles',
  'the': 'articles',
  
  // 2. Pronouns (Subject, Object, Possessive)
  'i': 'pronouns',
  'it': 'pronouns',
  'he': 'pronouns',
  'she': 'pronouns',
  'we': 'pronouns',
  'they': 'pronouns',
  'me': 'pronouns',
  'us': 'pronouns',
  'them': 'pronouns',
  'my': 'pronouns',
  'its': 'pronouns',
  
  // 3. Conjunctions (Coordinating & Subordinating)
  'and': 'conjunctions',
  'or': 'conjunctions',
  'but': 'conjunctions',
  'so': 'conjunctions',
  'if': 'conjunctions',
  'as': 'conjunctions',
  
  // 4. Prepositions
  'in': 'prepositions',
  'on': 'prepositions',
  'at': 'prepositions',
  'to': 'prepositions',
  'of': 'prepositions',
  'by': 'prepositions',
  
  // 5. Verbs (Present & Past)
  'is': 'verbs',
  'are': 'verbs',
  'was': 'verbs',
  'were': 'verbs'
};

/* 2. Single-character helpers — NO string methods */

function lowerCharCode(code) {
  // A=65..Z=90 → a=97..z=122
  if (code >= 65 && code <= 90) return code + 32;
  return code;
}

function isAlphaCode(code) {
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

/* 3. DFA transition — one character at a time. Returns next state name string. */
function transition(state, ch) {
  const row = DELTA[state];
  if (!row) return 'q33';                // unknown state → trap
  // Check explicit char label first
  const lower = String.fromCharCode(lowerCharCode(ch.charCodeAt(0)));
  if (row[lower] !== undefined) return row[lower];
  // Fall through to 'others'
  if (row['others'] !== undefined) return row['others'];
  return 'q33';
}

/* 4. Run DFA on a token (array of chars)
      Returns { accepted, traceSteps[], finalState, normWord }
      traceSteps: array of { ch, from, to } */
function runDFAOnToken(charArr) {
  let state = 'q0';
  const steps = [];
  // Build normalised word char-by-char for boundary check
  const normArr = [];

  for (let i = 0; i < charArr.length; i++) {
    const ch   = charArr[i];
    const from = state;
    const to   = transition(state, ch);
    steps.push({ ch: ch, from: from, to: to });
    state = to;
    // accumulate lowercase char for boundary check
    normArr.push(String.fromCharCode(lowerCharCode(ch.charCodeAt(0))));
  }

  // Build normalised word string (only safe join of our own array)
  let normWord = '';
  for (let i = 0; i < normArr.length; i++) normWord += normArr[i];

  // Accept iff final state is in ACCEPT_STATES AND word is a known stop word
  const accepted = (ACCEPT_STATES[state] === true) && (STOP_SET[normWord] === 1);

  return { accepted: accepted, steps: steps, finalState: state, normWord: normWord };
}

/* 5. Tokeniser — strictly char-by-char, no split/regex */
function tokenize(text) {
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    const code = text.charCodeAt(i);
    if (isAlphaCode(code)) {
      const chars   = [];
      const display = [];
      const start   = i;
      while (i < text.length && isAlphaCode(text.charCodeAt(i))) {
        chars.push(text.charAt(i));
        display.push(text.charAt(i));
        i++;
      }
      tokens.push({ chars: chars, display: display, start: start, type: 'word' });
    } else {
      tokens.push({ chars: [text.charAt(i)], display: [text.charAt(i)], start: i, type: 'other' });
      i++;
    }
  }
  return tokens;
}

/* 6. Build trace string from steps using q-labels
      Format: q0 --a-> q1 -> q5 */
function buildTraceStr(steps, startState) {
  let s = startState;
  for (let i = 0; i < steps.length; i++) {
    const lower = String.fromCharCode(lowerCharCode(steps[i].ch.charCodeAt(0)));
    s += ' --' + lower + '--> ' + steps[i].to;
  }
  return s;
}

/* 7. UI helpers */
function switchTab(name, btn) {
  const panels = document.querySelectorAll('.tab-panel');
  for (let i = 0; i < panels.length; i++) panels[i].classList.remove('active');
  const tabs = document.querySelectorAll('.tab');
  for (let i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
}

// Category groups for the stop-word legend
const STOP_WORD_CATEGORY_ORDER = [
  { key: 'articles', label: 'Articles', words: ['a', 'an', 'the'] },
  { key: 'pronouns', label: 'Pronouns', words: ['i', 'it', 'he', 'she', 'we', 'they', 'me', 'us', 'them', 'my', 'its'] },
  { key: 'conjunctions', label: 'Conjunctions', words: ['and', 'or', 'but', 'so', 'if', 'as'] },
  { key: 'prepositions', label: 'Prepositions', words: ['in', 'on', 'at', 'to', 'of', 'by'] },
  { key: 'verbs', label: 'Verbs', words: ['is', 'are', 'was', 'were'] }
];

const wordChips = document.getElementById('wordChips');
for (let i = 0; i < STOP_WORD_CATEGORY_ORDER.length; i++) {
  const group = STOP_WORD_CATEGORY_ORDER[i];
  const catClass = 'cat-' + group.label.toLowerCase();
  const section = document.createElement('div');
  section.className = 'category-group';

  const labelChip = document.createElement('span');
  labelChip.className = `chip ${catClass}`;
  labelChip.textContent = group.label;

  const wordsSpan = document.createElement('span');
  wordsSpan.className = 'category-words';
  wordsSpan.textContent = group.words.join(', ');

  section.appendChild(labelChip);
  section.appendChild(wordsSpan);
  wordChips.appendChild(section);
}

/* 8. HTML escape — char by char, no replace() */
function escapeHTML(str) {
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str.charAt(i);
    if      (ch === '&') out += '&amp;';
    else if (ch === '<') out += '&lt;';
    else if (ch === '>') out += '&gt;';
    else                 out += ch;
  }
  return out;
}

/* 9. Main run */
function runDFA() {
  const text = document.getElementById('textInput').value;
  if (!text) return;

  const tokens     = tokenize(text);
  const wordTokens = [];
  const matches    = [];   
  const logRows    = [];

  let tokenIdx = 0;

  for (let t = 0; t < tokens.length; t++) {
    const tok = tokens[t];
    if (tok.type !== 'word') continue;
    tokenIdx++;
    wordTokens.push(tok);

    const result     = runDFAOnToken(tok.chars);
    const traceStr   = buildTraceStr(result.steps, 'q0');

    logRows.push({
      display:    tok.display.join(''),
      normWord:   result.normWord,
      accepted:   result.accepted,
      traceStr:   traceStr,
      finalState: result.finalState,
      pos:        tok.start,
      idx:        tokenIdx
    });

    if (result.accepted) {
      matches.push({
        display:  tok.display.join(''),
        normWord: result.normWord,
        pos:      tok.start,
        tokenIdx: tokenIdx
      });
    }
  }

  /* Build position lookup */
  const matchPosSet = {};
  const matchCatSet = {};
  for (let m = 0; m < matches.length; m++) {
    matchPosSet[matches[m].pos] = true;
    matchCatSet[matches[m].pos] = STOP_WORD_CATEGORIES[matches[m].normWord] || 'default';
  }

  /*  Annotated output  */
  const out = document.getElementById('output');
  out.classList.remove('empty-state');
  let html = '';
  for (let t = 0; t < tokens.length; t++) {
    const tok = tokens[t];
    const raw = tok.display.join('');
    if (tok.type === 'word' && matchPosSet[tok.start]) {
      const cat = matchCatSet[tok.start];
      html += '<mark class="hit cat-' + cat + '" title="pos:' + tok.start + '">' + escapeHTML(raw) + '</mark>';
    } else {
      html += escapeHTML(raw);
    }
  }
  out.innerHTML = html;

  /*  Stats  */
  const uniqueObj = {};
  for (let m = 0; m < matches.length; m++) uniqueObj[matches[m].normWord] = true;
  const uniqueCount = Object.keys(uniqueObj).length;
  const pct = wordTokens.length ? Math.round(matches.length / wordTokens.length * 100) + '%' : '0%';
  document.getElementById('s-tokens').textContent = wordTokens.length;
  document.getElementById('s-hits').textContent   = matches.length;
  document.getElementById('s-unique').textContent = uniqueCount;
  document.getElementById('s-pct').textContent    = pct;

  /*  DFA Trace log  */
  const logEl = document.getElementById('log');
  logEl.classList.remove('empty-state');
  let logHTML = '';
  for (let r = 0; r < logRows.length; r++) {
    const row    = logRows[r];
    const cls    = row.accepted ? 'tag-accept' : 'tag-reject';
    const status = row.accepted ? 'ACCEPT'     : 'REJECT';
    logHTML +=
      '<div class="log-row">' +
        '<span class="' + cls + '">[' + status + ']</span>' +
        '<span class="log-word">"' + escapeHTML(row.display) + '"</span>' +
        '<span class="log-trace">' + escapeHTML(row.traceStr) + '</span>' +
      '</div>';
  }
  logEl.innerHTML = logHTML;

  /*  Position + Stop Word table */
  const posWrap = document.getElementById('posTableWrap');
  if (matches.length === 0) {
    posWrap.innerHTML = '';
  } else {
    let tHTML =
      '<div class="pos-table-wrap">' +
        '<div class="pos-table-label">matched stop words — position &amp; token index</div>' +
        '<table class="pos-table">' +
          '<thead><tr>' +
            '<th>#</th>' +
            '<th>token idx</th>' +
            '<th>stop word</th>' +
            '<th>category</th>' +
            '<th>char position</th>' +
            '<th>final state</th>' +
          '</tr></thead>' +
          '<tbody>';
    for (let m = 0; m < matches.length; m++) {
      const match = matches[m];
      const category = STOP_WORD_CATEGORIES[match.normWord] || 'unknown';
      const catDisplay = category.charAt(0).toUpperCase() + category.slice(1);
      // find finalState from logRows
      let fs = '—';
      for (let r = 0; r < logRows.length; r++) {
        if (logRows[r].pos === match.pos) { fs = logRows[r].finalState; break; }
      }
      tHTML +=
        '<tr>' +
          '<td>' + (m + 1) + '</td>' +
          '<td>' + match.tokenIdx + '</td>' +
          '<td class="cat-' + category + '">' + escapeHTML(match.display) + '</td>' +
          '<td class="cat-' + category + '">' + catDisplay + '</td>' +
          '<td>' + match.pos + '</td>' +
          '<td>' + fs + '</td>' +
        '</tr>';
    }
    tHTML += '</tbody></table></div>';
    posWrap.innerHTML = tHTML;
  }

  /*  Occurrences  */
  const counts = {};
  for (let m = 0; m < matches.length; m++) {
    const k = matches[m].normWord;
    counts[k] = (counts[k] || 0) + 1;
  }
  const entries = [];
  for (const k in counts) entries.push([k, counts[k]]);
  entries.sort(function(a, b) { return b[1] - a[1]; });

  const maxCount = entries.length > 0 ? entries[0][1] : 1;
  const occEl = document.getElementById('occTable');
  occEl.classList.remove('empty-state');

  if (entries.length === 0) {
    occEl.innerHTML = '<p class="empty-state">No stop words found.</p>';
  } else {
    let oHTML =
      '<table class="occ-table">' +
        '<thead><tr><th>#</th><th>word</th><th>count</th><th>frequency</th></tr></thead>' +
        '<tbody>';
    for (let e = 0; e < entries.length; e++) {
      const w   = entries[e][0];
      const cnt = entries[e][1];
      const bw  = Math.round(cnt / maxCount * 160);
      const pf  = Math.round(cnt / wordTokens.length * 100);
      oHTML +=
        '<tr>' +
          '<td>' + (e + 1) + '</td>' +
          '<td>' + w + '</td>' +
          '<td>' + cnt + '</td>' +
          '<td>' +
            '<span class="occ-bar" style="width:' + bw + 'px"></span>' +
            '<span style="font-size:10px;color:var(--text3);margin-left:4px">' + pf + '%</span>' +
          '</td>' +
        '</tr>';
    }
    oHTML += '</tbody></table>';
    occEl.innerHTML = oHTML;
  }

  /* Switch to annotated tab (or positions if matches exist) */
    const allTabs   = document.querySelectorAll('.tab');
    const allPanels = document.querySelectorAll('.tab-panel');
    for (let i = 0; i < allTabs.length;   i++) allTabs[i].classList.remove('active');
    for (let i = 0; i < allPanels.length; i++) allPanels[i].classList.remove('active');

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelector('.tab[onclick*="annotated"]').classList.add('active');
    document.getElementById('tab-annotated').classList.add('active');
}

/* 10. Clear */
function clearAll() {
  document.getElementById('textInput').value = '';
  document.getElementById('output').className   = 'empty-state';
  document.getElementById('output').innerHTML   = 'Run the DFA on a text to see annotated output.';
  document.getElementById('log').className      = 'empty-state';
  document.getElementById('log').innerHTML      = 'State trace will appear here after running.';
  document.getElementById('posTableWrap').innerHTML = '';
  document.getElementById('occTable').className = 'empty-state';
  document.getElementById('occTable').innerHTML = 'Occurrence table will appear after running.';
  const ids = ['s-tokens','s-hits','s-unique','s-pct'];
  for (let i = 0; i < ids.length; i++) document.getElementById(ids[i]).textContent = '—';
}

runDFA();