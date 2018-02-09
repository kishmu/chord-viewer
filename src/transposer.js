'use strict';
import consts from './consts';

class Transposer {
  constructor(oldKey, newKey) {
    // semitone to transpose
    let oldKeyRoot = oldKey.match(consts.RE.NOTE)[0];
    if (!(oldKeyRoot in consts.SYMBOL2NUM)) {
      throw new Error(`invalid oldKey: ${oldKey}`);
    }
    if (Number(newKey)) { // transpose value as semitone +/-
      this.semitones = newKey % 12;
    } else {
      let newKeyRoot = newKey.match(consts.RE.NOTE)[0];
      if (!(newKeyRoot in consts.SYMBOL2NUM)) {
        throw new Error(`invalid newKey: ${newKey}`);
      }
      this.semitones = consts.SYMBOL2NUM[newKeyRoot] - consts.SYMBOL2NUM[oldKeyRoot];
    }
    if (this.semitones < 0) {
      this.semitones = 12 + this.semitones;
    }

    // keylookup
    if (Number(newKey)) {
      newKey = consts.PREFERRED_KEYS[(consts.SYMBOL2NUM[oldKeyRoot] + this.semitones) % 12];
    }
    if (consts.SHARP_KEYS.indexOf(newKey) > -1) {
      this.keyLookup = consts.SHARPS;
    } else {
      this.keyLookup = consts.FLATS;
    }
  }

  getNew(oldChord) {
    if (!oldChord) {
      return;
    }
    let chordRoot = oldChord.match(consts.RE.NOTE);
    chordRoot = chordRoot && chordRoot[0];
    if (!(chordRoot in consts.SYMBOL2NUM)) {
      throw new Error(`unknown chord symbol '${oldChord}'`);
    }
    return oldChord.replace(chordRoot, this.keyLookup[(consts.SYMBOL2NUM[chordRoot] + this.semitones) % 12]);
  }
}

export default Transposer;