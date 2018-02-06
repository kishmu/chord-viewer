'use strict';
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

function reduceMap(map, cb, initialValue) {
  let ret;
  let index = 0;
  let iterator = map.entries();
  if (initialValue === undefined || initialValue === null) {
    ret = iterator.next().value;
    index++;
  } else {
    ret = initialValue;
  }
  for (let v of iterator) {
    ret = cb(ret, v, index++);
  }
  return ret;
}

class Sheet {
  constructor() {
    this.songSections = new Map(); // use map to preserve insertion order
  }

  parse(sheet) {
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
    return this;
  }

  parseHeader(header) {
    if (!header || header.length < 3) {
      throw new Error('invalid header, length < 3');
    }
    this.songName = header[0];
    this.key = header[1].match(consts.RE.CHORD)[0];
    if (!this.key) {
      throw new Error(`unknown key ${header[1]}`);
    }
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

  transposeLine(line, transposer) {

//     let lines = chords.split('\n');

// lines = lines.map((line) => {
//   let index = line.indexOf('|');
//   if (index > -1) {
//     let lyrics = line.substring(0, index-1);
//     let chords = line.substring(index);
//     return `${lyrics}${chords.replace(consts.RE.CHORD, '*')}`;
//   } else {
//     return line;
//   }
// });

    let index = line.indexOf('|');
    if (index > -1) {
      let lyrics = line.substring(0, index-1);
      let chords = line.substring(index);
      return `${lyrics}${chords.replace(consts.RE.CHORD, (chord) => {
        return chord.replace(chord, transposer.getNew(chord));
      })}`;
    } else {
      return line;
    }
  }

  transpose(newKey) {
    if (this.key === newKey || newKey === 0) {
      return this;
    }
    let transposer = new Transposer(this.key, newKey);
    let transposedSections = new Map();
    this.songSections.forEach((chords, sectionName) => {
      let lines = chords.split('\n');
      lines = lines.map((line) => {
        return this.transposeLine(line, transposer);
      });
      transposedSections.set(sectionName, lines.join('\n'));
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

  toString() {
    let header = `${this.songName} - ${this.key} - ${this.timeSignature} \nmovie:${this.movie ? this.movie : ' --'}\n\n`;
    let sections = reduceMap(this.songSections, (acc, [sectionName, chords]) => {
      let underline = '-'.repeat(sectionName.length);
      return acc + `${sectionName}\n${underline}\n${chords}\n\n`;
    }, '');
    return header + sections;
  }
}

module.exports = Sheet;