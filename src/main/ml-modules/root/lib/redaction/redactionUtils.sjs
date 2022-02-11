const LOCK = Symbol('lock');

/**
 * Polyfill for `Object.fromEntries` since that is not implemented in ML JS engine
 *
 * @param  {[string, unknown][]}  entries  The entries to create an object using
 *
 * @return {Object}
 */
function fromEntries(entries) {
  const res = {};

  for (const [key, value] of entries) {
    res[key] = value;
  }

  return res;
}

class CipherCharset extends String {
  /**
   * Get a cached cipher charset. Creates a new instance if there is no cached value.
   *
   * @type   {CipherCharset}
   */
  static get(chars) {
    // Remove duplicate characters from the provided character set
    const charset = [...new Set([...chars])].join('');

    if (!this.cache.has(charset)) {
      this.cache.set(charset, new CipherCharset(LOCK, charset));
    }

    return this.cache.get(charset);
  }

  /**
   * @param  {unique symbol} lock  Prevent use of `new CipherCharset(...)` and enforce use of `CipherCharset.get(chars)`
   * @param  {string}        chars The characters to use in this CipherCharset
   */
  constructor(lock, chars) {
    if (lock !== LOCK) {
      throw new Error('Please use CipherCharset.get(chars) instead');
    }

    super(chars);

    this.offsets = this.generateOffsets();
  }

  /**
   * Get the character at the given index, wrapping where necessary
   *
   * @param  {number}  idx  The index
   *
   * @return {string}
   */
  charAt(idx) {
    return super.charAt(idx % this.length);
  }

  /**
   * Get the offset at the given index, wrapping where necessary
   *
   * @param  {number}  idx  The index
   *
   * @return {number}
   */
  offsetAt(idx) {
    return this.offsets[idx % this.length];
  }

  /**
   * Generate offsets for each character in the character set
   *
   * @return {number[]}
   */
  generateOffsets() {
    const l = this.length;

    const res = Array(l);

    for (let i = 0; i < l; i++) {
      res[i] = xdmp.hash32(this.charAt(i)) % l;
    }

    return res;
  }
}
/** Cache of previously created CipherCharsets by the characters in the charset */
CipherCharset.cache = new Map();

/**
 * Generic string cipher. Takes a character set containing all characters that will be enciphered/deciphered by this class
 *
 * @class  StringCipher
 */
class StringCipher {
  /**
   * @param  {string?}  [charset='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~`_!@#$%^&*()[]{}+-\'"\\/.,;:|']
   */
  constructor(charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~`_!@#$%^&*()[]{}+-\'"\\/.,;:|') {
    this.charset = CipherCharset.get(charset);

    this.decipherCharacters = this.decipherCharacters.bind(this);
    this.encipherCharacters = this.encipherCharacters.bind(this);
  }

  /**
   * Decipher the given string
   *
   * @param  {string}  input  The string to decipher
   *
   * @return {string}
   */
  decipher(input) {
    return [...this.normalizeInput(input)].map(this.decipherCharacters).join('');
  }

  /**
   * Encipher the given string
   *
   * @param  {string}  input  The string to decipher
   *
   * @return {string}
   */
  encipher(input) {
    return [...this.normalizeInput(input)].map(this.encipherCharacters).join('');
  }

  /**
   * Normalize the input into a form that will be usable by the decipher/encipher methods
   *
   * @param  {string}  input  The input
   *
   * @return {string}
   */
  normalizeInput(input) {
    return input.toString();
  }

  /**
   * Called iteratively for each character of the input string to determine the original character for that index.
   * Ignores characters in the input string which do not exist in the charset for this cipher.
   *
   * @param  {string}   c    The character at the current index
   * @param  {number}   idx  The current index
   *
   * @return {string}
   */
  decipherCharacters(c, idx) {
    const cIdx = this.charset.indexOf(c);

    return cIdx === -1
      ? c
      : this.getOriginalCharacter(cIdx, idx);
  }

  /**
   * Called iteratively for each character of the input string to determine the resulting character for that index.Ignores characters in the input string which do not exist in the charset for this cipher.
   *
   * @param  {string}   c    The character at the current index
   * @param  {number}   idx  The current index
   *
   * @return {string}
   */
  encipherCharacters(c, idx) {
    const cIdx = this.charset.indexOf(c);

    return cIdx === -1
      ? c
      : this.getResultingCharacter(cIdx, idx);
  }

  /**
   * Gets the original character for a decipher operation.
   *
   * @param  {number}  cIdx  The character index in the charset
   * @param  {number}  idx   The character index in the input string
   *
   * @return {string}
   */
  getOriginalCharacter(cIdx, idx) {
    return this.charset.charAt(this.charset.length + cIdx - this.charset.offsetAt(idx));
  }

  /**
   * Gets the resulting character for a decipher operation.
   *
   * @param  {number}  cIdx  The character index in the charset
   * @param  {number}  idx   The character index in the input string
   *
   * @return {string}
   */
  getResultingCharacter(cIdx, idx) {
    return this.charset.charAt(cIdx + this.charset.offsetAt(idx));
  }
}

/**
 * Dedicated cipher for numeric values
 *
 * @class  NumberCipher
 */
class NumberCipher extends StringCipher {
  /**
   * @param  {number}  [size=0]  The minimum character length of the output. If the input is too short, it will be left-padded with 0's
   */
  constructor(size = 0) {
    super('0123456789');

    this.padding = '0'.repeat(size);
    this.size = size;
  }

  /**
   * Force the input to be stringified and left-padded with 0s up to the minimum output size (if any)
   *
   * @param  {string}  input  The input
   *
   * @return {string}
   */
  normalizeInput(input) {
    return (this.padding + input.toString(10)).slice(-this.size);
  }
}

class CaseInsensitiveStringCipher extends StringCipher {
  /**
   * @param  {string}  [charset='abcdefghijklmnopqrstuvwxyz0123456789~`_!@#$%^&*()[]{}+-\'"\\/.,;:|']  The charset
   */
  constructor(charset = 'abcdefghijklmnopqrstuvwxyz0123456789~`_!@#$%^&*()[]{}+-\'"\\/.,;:|') {
    super(charset.toLowerCase());
  }

  /**
   * Force the input to be all lower case in order to match the character set for this cipher
   *
   * @param  {string}  input  The input
   *
   * @return {string}
   */
  normalizeInput(input) {
    return super.normalizeInput(input).toLowerCase();
  }
}

/**
 * Ensure the value for the given variable has the correct type
 *
 * @param  {string}  varname  The varname
 * @param  {unknown} value    The value
 * @param  {string}  type     The type that the value should be
 *
 * @throws If the value is not of the correct type
 */
function checkType(varname, value, type) {
  if (typeof value !== type) {
    throw new TypeError(`Parameter "${varname}" must be a ${type}`);
  }
}

/**
 * Wrapper function which provides the string value of a node to the wrapped function as the first parameter
 *
 * @param  {Function}  cb  The wrapped function
 *
 * @return {Function}
 */
function UsesStringValue(cb) {
  checkType('cb', cb, 'function');

  return function(node, ...a) {
    return cb(fn.string(node), ...a);
  }
}

/**
 * Wrapper function which provides the root document containing the given node to the wrapped function as the first parameter
 *
 * @param  {Function}  cb  The wrapped function
 *
 * @return {Function}
 */
function UsesRootNode(cb) {
  checkType('cb', cb, 'function');

  return function(node, ...a) {
    return cb(fn.root(node).root, ...a);
  }
}

/**
 * Wrapper function which creates a Node with the output of the wrapped function
 *
 * @param  {Function}  cb  The wrapped function
 *
 * @return {Function}
 */
function CreatesNode(cb) {
  checkType('cb', cb, 'function');

  return function(...a) {
    const builder = new NodeBuilder();
    builder.addText(cb(...a));
    return builder.toNode();
  };
}

/**
 * Add the given amounts to the base date
 *
 * @param  {Date}   date     The base date
 * @param  {Object} options  The amounts to add to the base date
 *
 * @return {Date}
 */
function dateTimeAdd(date, options) {
  const res = new Date(date);

  if (options.years) {
    res.setUTCFullYear(res.getUTCFullYear() + options.years);
  }
  if (options.months) {
    res.setUTCMonth(res.getUTCMonth() + options.months);
  }
  if (options.days) {
    res.setUTCDate(res.getUTCDate() + options.days);
  }
  if (options.hours) {
    res.setUTCHours(res.getUTCHours() + options.hours);
  }
  if (options.minutes) {
    res.setUTCMinutes(res.getUTCMinutes() + options.minutes);
  }
  if (options.seconds) {
    res.setUTCSeconds(res.getUTCSeconds() + options.seconds);
  }

  return res;
}

/**
 * Gets an ISO-8601 date string from a date.
 *
 * @param  {Date}  date  The date
 *
 * @return {string}
 */
function getDateString(date) {
  return date.toISOString().split('T').shift();
}

/**
 * Gets an ISO-8601 time string from a date.
 *
 * @param  {Date}  date  The date
 *
 * @return {string}
 */
function getTimeString(date) {
  date.setUTCMilliseconds(0);

  return date.toISOString().split('T').pop();
}

/**
 * Returns a new date which is created deterministically from the original date, within a given range
 *
 * @param  {Date}  min     The minimum date to use
 * @param  {Date}  max     The maximum date to use
 * @param  {Date}  actual  The actual date to use
 *
 * @return {Date}
 */
function deterministicDate(min, max, actual) {
  const diff = max.getTime() - min.getTime();

  return new Date(min.getTime() + ((Number(xdmp.hash64(getDateString(actual))) % Number.MAX_SAFE_INTEGER) % diff));
}

/**
 * Return a deterministic new date from the provided date
 *
 * @param  {string}  value    The date string to use
 * @param  {Object}  options  The options
 *
 * @return {Date}
 */
function redactDateWithinRange(value, options) {
  const date = new Date(value);
  const min = dateTimeAdd(date, /*Object.*/fromEntries(Object.entries(options).map(([key, value]) => [key, -value])));
  const max = dateTimeAdd(date, options);

  return deterministicDate(min, max, date);
}

/**
 * Returns a new date which is created deterministically from the original date, within a given range
 *
 * @param  {Date}  min     The minimum date to use
 * @param  {Date}  max     The maximum date to use
 * @param  {Date}  actual  The actual date to use
 *
 * @return {Date}
 */
function deterministicTime(min, max, actual) {
  const diff = max.getTime() - min.getTime();

  return new Date(min.getTime() + (xdmp.hash32(getTimeString(actual)) % diff));
}

/**
 * Return a deterministic new date from the provided date
 *
 * @param  {string}  value    The date string to use
 * @param  {Object}  options  The options
 *
 * @return {Date}
 */
function redactTimeWithinRange(value, options) {
  const time = new Date(value);
  const min = dateTimeAdd(time, /*Object.*/fromEntries(Object.entries(options).map(([key, value]) => [key, -value])));
  const max = dateTimeAdd(time, options);

  return deterministicTime(min, max, time);
}

/**
 * Verify that the given paths within the target document have been redacted when compared to the original source document
 *
 * @param  {Document}  source  The source
 * @param  {Document}  target  The target
 * @param  {string[]}  paths   The paths
 *
 * @return {Array}
 */
function verifyRedaction(source, target, paths) {
  const tests = [];

  for (const path of paths) {
    const sNodes = source.xpath(path).toArray();
    const tNodes = target.xpath(path).toArray();

    if (sNodes.length) {
      sNodes.forEach((sNode, idx) => {
        const sData = fn.string(sNode);
        const tData = fn.string(tNodes[idx]);

        const success = sData && sData !== tData;

        tests.push({
          document: source.baseURI,
          path: xdmp.path(sNode),
          result: `"${sData}" -> "${tData}"`,
          success,
        });
      });
    } else {
      tests.push({
        document: source.baseURI,
        path,
        result: 'No data in source to redact',
        success: true,
      });
    }
  }

  return tests;
}

module.exports = {
  UsesStringValue,
  UsesRootNode,
  CreatesNode,
  NumberCipher,
  StringCipher,
  CaseInsensitiveStringCipher,

  getDateString,
  getTimeString,
  redactDateWithinRange,
  redactTimeWithinRange,

  fromEntries,
  verifyRedaction,
};
