'use strict';
const consts = require('./consts');

class Transposer {
  constructor(oldKey, newKey) {
    if (!oldKey in consts.SYMBOL2NUM) {
      throw new Error(`invalid oldKey: ${oldKey}`);
    }

    // semitone to transpose
    if (Number(newKey)) { // transpose value as semitone +/-
      this.semitones = newKey % 12;
    } else {
      if (!newKey in consts.SYMBOL2NUM) {
        throw new Error(`invalid newKey: ${newKey}`);
      }
      this.semitones = consts.SYMBOL2NUM[newKey] - consts.SYMBOL2NUM[oldKey];
    }
    if (this.semitones < 0) {
      this.semitones = 12 + this.semitones;
    }

    // keylookup
    if (Number(newKey)) {
      newKey = consts.PREFERRED_KEYS[(consts.SYMBOL2NUM[oldKey] + this.semitones) % 12];
    }
    if (consts.SHARP_KEYS.indexOf(newKey) > -1) {
      this.keyLookup = consts.SHARPS;
    } else {
      this.keyLookup = consts.FLATS;
    }
  }

  getNew(oldChord) {
    let chordRoot = oldChord.match(consts.RE.NOTE);
    chordRoot = chordRoot && chordRoot[0];
    if (!(chordRoot in consts.SYMBOL2NUM)) {
      throw new Error(`unknown chord symbol '${oldChord}'`);
    }
    return oldChord.replace(chordRoot, this.keyLookup[(consts.SYMBOL2NUM[chordRoot] + this.semitones) % 12]);
  }
}

module.exports = Transposer;

//