'use strict';

const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const Transposer = require('./transposer');

const RE_NOTE = new RegExp(`[A-G](?:#|b)?`);
const RE_CHORD = new RegExp(`${RE_NOTE.source}[a-z|1-7|#|b|\\-|\\+]*`);
const RE_CHORDS = new RegExp(`${RE_CHORD.source}`, 'g');

const SECTION_NAMES = ['intro', 'interlude', 'verse', 'chorus', 'end', 'ending', 'coda', 'pallavi', 'charanam'];
const RE_SECTIONS = new RegExp(`((?:\\|\\|)?(?:${SECTION_NAMES.join('|')})\\s*\\d*:(?:\\|\\|)?)`);
const RE_SECTION_NAME = new RegExp(`^(?:\\|\\|)?\\s*${SECTION_NAMES.join('|')}(?:\\s:\\|\\|)?`);

/* sheet format:
     songname - key - timesig <== Header
    (optional) movie:
    (optional) additional notes

    section name: (e.g., intro, verse 1, verse 2, interlude 1) - (optional) x multiplier for repeating sections
    lyrics  | chords |
            || repeat || with optional (x multiplier). No multiplier means single repeat

        {paragraphs with empty line separation}
    */
class Sheet {
  constructor(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Path ${filePath} does not exist`);
    }

    this.filePath = filePath;
    this.songSections = new Map(); // use map to preserve insertion order
  }

  parse() {
    return readFile(this.filePath, 'utf-8').then((sheet) => {
      let sections = sheet.split(RE_SECTIONS);
      let header;
      while (!header && sections.length > 0) {
        header = sections.shift().split(/(?: - )/);
      }
      this.parseHeader(header);
      sections.forEach((item, index) => {
        if (RE_SECTION_NAME.test(item) && sections[index + 1]) {
          this.songSections.set(item, sections[index + 1]);
        }
      });
    });
  }

  parseHeader(header) {
    if (!header || header.length < 3) {
      throw new Error('invalid header, length < 3');
    }
    this.songName = header[0];
    this.key = header[1].match(new RegExp(`^${RE_NOTE.source}$`));
    if (!this.key) {
      throw new Error(`unknown key ${header[1]}`);
    }
    this.key = this.key[0];
    let rest = header[2].split(/\n+/);
    if (rest.length < 1) {
      throw new Error('no time signature');
    }
    this.timeSignature = rest.shift();
    if (rest.length > 0) {
      this.movie = rest.shift();
      this.movie = this.movie.match(/^movie\s*:\s*(.*)/);
      if (this.movie && this.movie.length >= 2) {
        this.movie = this.movie[1];
      } else {
        this.movie = '';
      }
    }
  }

  transpose(newKey) {
    let transposer = new Transposer(this.key, newKey);
    let transposedSections = new Map();
    this.songSections.forEach((v, k) => {
      transposedSections.set(k, v.replace(RE_CHORDS, (match) => {
        return transposer.getNew(match);
      }));
    });
    return transposedSections;
  }

  print(sections) {
    console.log(`${this.songName} - ${this.key} - ${this.timeSignature}`);
    if (this.movie) console.log(`movie: ${this.movie}`);
    sections.forEach((v, k) => {
      console.log(k);
      console.log(v);
    });
  }
}

let sheet = new Sheet('../sheets/nee-oru-kadal.txt');
sheet.parse().then(() => {
  sheet.print(sheet.transpose('E'));
});