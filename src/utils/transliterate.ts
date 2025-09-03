// Simple Latin-to-Arabic transliteration focused on personal names
// Note: This is heuristic. It prioritizes common football name patterns.

const DIACRITICS_MAP: Record<string, string> = {
  à: 'a', á: 'a', â: 'a', ä: 'a', ã: 'a', å: 'a', ā: 'a',
  ç: 'c',
  è: 'e', é: 'e', ê: 'e', ë: 'e', ē: 'e',
  ì: 'i', í: 'i', î: 'i', ï: 'i', ī: 'i',
  ñ: 'n',
  ò: 'o', ó: 'o', ô: 'o', ö: 'o', õ: 'o', ō: 'o',
  ù: 'u', ú: 'u', û: 'u', ü: 'u', ū: 'u',
  ý: 'y', ÿ: 'y',
  œ: 'oe', æ: 'ae'
};

function stripDiacritics(input: string): string {
  return input
    .split('')
    .map(ch => DIACRITICS_MAP[ch as keyof typeof DIACRITICS_MAP] ?? ch)
    .join('');
}

// Order matters: handle digraphs/trigraphs before single letters
const SEQUENCE_RULES: Array<[RegExp, string]> = [
  [/oung/gi, 'ونغ'],
  [/oung/gi, 'ونغ'],
  [/ng/gi, 'نغ'],
  [/kh/gi, 'خ'],
  [/gh/gi, 'غ'],
  [/sh/gi, 'ش'],
  [/ch/gi, 'تش'], // closest for many names
  [/th/gi, 'ث'],
  [/ph/gi, 'ف'],
  [/zh/gi, 'ج'], // approximate
  [/ts/gi, 'تس'],
  [/dz/gi, 'دز'],
  [/qu/gi, 'كو'],
  [/ou/gi, 'و'],
  [/ow/gi, 'و'],
  [/oo/gi, 'و'],
  [/ee/gi, 'ي'],
  [/ea/gi, 'يا'],
  [/ai/gi, 'اي'],
  [/ay/gi, 'اي'],
  [/au/gi, 'او'],
  [/oi/gi, 'وي'],
  [/oy/gi, 'وي'],
];

const LETTER_RULES: Record<string, string> = {
  a: 'ا', b: 'ب', c: 'ك', d: 'د', e: 'ي', f: 'ف', g: 'ج', h: 'ه', i: 'ي', j: 'ج',
  k: 'ك', l: 'ل', m: 'م', n: 'ن', o: 'و', p: 'ب', q: 'ق', r: 'ر', s: 'س', t: 'ت',
  u: 'و', v: 'ف', w: 'و', x: 'كس', y: 'ي', z: 'ز'
};

function transliterateWordLatinToArabic(word: string): string {
  let clean = stripDiacritics(word);

  // Apply sequences
  SEQUENCE_RULES.forEach(([re, repl]) => {
    clean = clean.replace(re, repl);
  });

  // Replace remaining letters
  let out = '';
  for (const ch of clean) {
    const lower = ch.toLowerCase();
    if (LETTER_RULES[lower]) {
      out += LETTER_RULES[lower];
    } else if (/[\d]/.test(ch)) {
      out += ch; // keep digits
    } else if (ch === "'" || ch === "-" || ch === "·") {
      out += ' ';
    } else {
      out += ch; // spaces and others
    }
  }

  // Heuristic: initial vowel often needs hamza seat for better reading
  out = out.replace(/^ا([وي])/u, 'إ$1');
  return out;
}

export function transliterateToArabic(fullName: string): string {
  if (!fullName) return '';
  // Split by spaces, handle each token
  const parts = fullName.split(/\s+/).filter(Boolean);
  return parts.map(p => transliterateWordLatinToArabic(p)).join(' ').replace(/\s+/g, ' ').trim();
}

export function maybeTransliterateName(fullName: string, currentLanguage: string): string {
  if (!fullName) return '';
  if (currentLanguage === 'ar') return transliterateToArabic(fullName);
  return fullName;
}
