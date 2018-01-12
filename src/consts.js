const SECTION_NAMES = ['intro', 'interlude', 'verse', 'chorus', 'end', 'ending', 'coda', 'pallavi', 'charanam'];
const RE = {
  NOTE: new RegExp(`[A-G](?:#|b)?`),
  SECTIONS: new RegExp(`((?:\\|\\|)?(?:${SECTION_NAMES.join('|')})\\s*\\d*:(?:\\|\\|)?)`),
  SECTION_NAME: new RegExp(`^(?:\\|\\|)?\\s*${SECTION_NAMES.join('|')}(?:\\s:\\|\\|)?`)
};

RE.CHORD = new RegExp(`${RE.NOTE.source}[a-z|1-7|#|b|\\-|\\+]*`);
RE.CHORDS = new RegExp(`${RE.CHORD.source}`, 'g');

const SYMBOL2NUM = {
  'C': 0,
  'C#': 1,
  'Db': 1,
  'D': 2,
  'D#': 3,
  'Eb': 3,
  'E': 4,
  'F': 5,
  'F#': 6,
  'Gb': 6,
  'G': 7,
  'G#': 8,
  'Ab': 8,
  'A': 9,
  'A#': 10,
  'Bb': 10,
  'B': 11
};

const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const PREFERRED_KEYS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const SHARP_KEYS = ['C#', 'D', 'D#', 'E', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_KEYS = ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb'];

module.exports = {
  RE,
  SECTION_NAMES,
  SYMBOL2NUM,
  SHARPS,
  FLATS,
  PREFERRED_KEYS,
  SHARP_KEYS,
  FLAT_KEYS
};



