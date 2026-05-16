const crypto = require('crypto');

const nowISO = () => new Date().toISOString();

const genCode = (n = 5) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < n; i++) {
    code += alphabet[crypto.randomInt(alphabet.length)];
  }
  return code;
};

const genPin = (n = 5) => {
  const digits = '0123456789';
  let pin = '';
  for (let i = 0; i < n; i++) {
    pin += digits[crypto.randomInt(digits.length)];
  }
  return pin;
};

const extractJson = (text) => {
  text = text.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  try {
    return JSON.parse(text);
  } catch {}
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {}
  }
  throw new Error('Could not parse JSON from LLM response');
};

module.exports = { nowISO, genCode, genPin, extractJson };
