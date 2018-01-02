'use strict';

const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

const RE_NOTE = /[A-G]/;
const SECTION_NAMES = ['intro', 'interlude', 'verse', 'chorus', 'end', 'ending', 'coda', 'pallavi', 'charanam'];
const RE_SECTIONS = new RegExp(`((?:\\|\\|)?(?:${SECTION_NAMES.join('|')})\\s*\\d*:(?:\\|\\|)?)`);
const RE_SECTION_NAME = new RegExp(`^(?:\\|\\|)?\\s*${SECTION_NAMES.join('|')}(?:\\s:\\|\\|)?`);

/* - file format
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
  }

  parse() {
    readFile(this.filePath, 'utf-8').then((sheet) => {
      let re = new RegExp(``);
      // let sections = sheet.split(/((?:\|\|)*(?:intro|interlude|verse|end|pallavi|charanam) *\d*:(?:\|\|)*)/);
      let sections = sheet.split(RE_SECTIONS);
      let header;
      while (!header && sections.length > 0) {
        header = sections.shift().split(/(?: - )/);
      }
      this.parseHeader(header);
      this.songSections = {};
      sections.forEach((item, index) => {
        if (RE_SECTION_NAME.test(item) && sections[index + 1]) {
          this.songSections[item] = sections[index + 1];
        }
      });
    });
  }

  parseHeader(header) {
    if (!header || header.length < 3) {
      throw new Error('invalid header, length < 3');
    }
    this.songName = header[0];
    this.key = header[1].match(RE_NOTE);
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
      this.movie = this.movie.match(/^movie *: *(.*)/);
      if (this.movie && this.movie.length >= 2) {
        this.movie = this.movie[1];
      } else {
        this.movie = '';
      }
    }
  }

  transpose() {

  }
}

let sheet = new Sheet('../sheets/nee-oru-kadal.txt').parse();