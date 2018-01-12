'use strict';

const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const consts = require('./consts');
const Transposer = require('./transposer');

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
    if (filePath && !fs.existsSync(filePath)) {
      throw new Error(`Path ${filePath} does not exist`);
    }

    this.filePath = filePath;
    this.songSections = new Map(); // use map to preserve insertion order
  }

  parse() {
    return readFile(this.filePath, 'utf-8').then((sheet) => {
      let header;
      let sections = sheet.split(consts.RE.SECTIONS);
      while (!header && sections.length > 0) {
        header = sections.shift().split(/(?: - )/);
      }
      this.parseHeader(header);
      sections.forEach((item, index) => {
        if (consts.RE.SECTION_NAME.test(item) && sections[index + 1]) {
          this.songSections.set(item, sections[index + 1].trim().replace(/^-*/, ''));
        }
      });
    });
  }

  parseHeader(header) {
    if (!header || header.length < 3) {
      throw new Error('invalid header, length < 3');
    }
    this.songName = header[0];
    this.key = header[1].match(new RegExp(`^${consts.RE.NOTE.source}$`));
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
    if (this.key === newKey) {
      return this.songSections;
    }
    let transposer = new Transposer(this.key, newKey);
    let transposedSections = new Map();
    this.songSections.forEach((v, k) => {
      transposedSections.set(k, v.replace(consts.RE.CHORDS, (match) => {
        return transposer.getNew(match);
      }));
    });
    let ret = new Sheet();
    // header
    ret.songName = this.songName;
    ret.key = transposer.getNew(this.key);
    ret.timeSignature = this.timeSignature;
    ret.movie = this.movie;
    // sections
    ret.songSections = transposedSections;
    return ret;
  }

  print() {
    console.log(`${this.songName} - ${this.key} - ${this.timeSignature}`);
    if (this.movie) console.log(`movie: ${this.movie}`);
    console.log('');
    this.songSections.forEach((v, k) => {
      console.log(k);
      console.log('-'.repeat(k.length));
      console.log(v);
      console.log('');
    });
  }
}

let sheet = new Sheet('../sheets/nee-oru-kadal.txt');
sheet.parse().then(() => {
  sheet.transpose('-5').print();
});