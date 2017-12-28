'use strict';

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

class Transposer {
  constructor(oldKey, newKey) {
    if (!(oldKey in SYMBOL2NUM && newKey in SYMBOL2NUM)) {
      throw new Error(`invalid input oldKey: ${oldKey}, newKey: ${newKey}`);
    }
    if (SHARPS.indexOf(newKey) > -1) {
      this.keyLookup = SHARPS;
    } else {
      this.keyLookup = FLATS;
    }
    this.amount = SYMBOL2NUM[newKey] - SYMBOL2NUM[oldKey];
    if (this.amount < 0) {
      this.amount = 12 + this.amount;
    }
  }

  getNew(oldChord) {
    if (!(oldChord in SYMBOL2NUM)) {
      throw new Error(`unknown chord symbol '${oldChord}'`);
    }
    return this.keyLookup[(this.amount + SYMBOL2NUM[oldChord]) % 12];
  }
}

let transposer = new Transposer('C', 'Bb');

/* eslint-disable no-console */
console.log(transposer.getNew('C'));
console.log(transposer.getNew('C#'));
console.log(transposer.getNew('E'));
console.log(transposer.getNew('B'));

module.exports = Transposer;

//