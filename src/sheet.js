'use strict';
import consts from './consts';
import Transposer from './transposer';
import _ from 'lodash';

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
  constructor() {
    // header
    this.songName = null;
    this.key = null;
    this.timeSignature = null;

    // rest of the song
    this.parts = null;
  }

  /**
   * Parse chord sheet separated into parts, lyrics and chords.
   * The resulting this.parts would look like:
   * [
   *  [
   *    'header', [
   *      ['line1'], 
   *      ['line2'], 
   *    ]
   *  ],
   *  [
   *    'intro', [
   *      ['lyric-line1', 'chords'], 
   *      ['lyric-line2', 'chords'], 
   *    ]
   *  ],
   *  [
   *    'verse 1:', [
   *      ['lyric-line1', 'chords'], 
   *      ['lyric-line2', 'chords'], 
   *    ]
   *  ]
   * ]
   * @param {*} sheet 
   */
  parse(sheet) {
    let parts = [];
    let song = sheet.split(consts.RE.SECTIONS).map(item => item.trim()); // ['...', 'intro 1:', '...', 'verse 1':, '...']
    if (song.length < 3) { // must at least have a header, one section, and chords for the section
      throw new Error('Invalid song. Must have at least 3 parts');
    }

    this.parseHeader(song.shift());
    
    while (song.length > 0) {
      parts.push([ song.shift(), song.shift().trim().replace(/^-*/, '') ]); // [part_name, chords]
    }

    // split each line within each part into lyrics and chords
    this.parts = parts.map(([partName, data]) => {
      let lines = data.split('\n').map((line) => {
        let index = line.indexOf('|');
        if (index > -1) {
          let lyrics = line.substring(0, index).trim();
          let chords = line.substring(index).trim();
          return [lyrics, chords];
        } else {
          return [line, ''];
        }
      });
      return [partName, lines];
    });
    
    return this;
  }

  parseHeader(header) {
    let lines = header.split('\n').map(item => item.trim());
    if (lines.length < 1) {
      throw new Error('invalid header');
    }
    let firstLine = lines.shift();
    firstLine = firstLine.split(/(?: - )/).map(item => item.trim());
    if (firstLine.length < 3) {
      throw new Error('invalid header');
    }
    this.songName = firstLine[0];
    this.key = firstLine[1].match(consts.RE.CHORD)[0];
    if (!this.key) {
      throw new Error(`unknown key ${header[1]}`);
    }
    this.timeSignature = firstLine[2];
    if (lines[0]) {
      this.movie = lines.shift();
      this.movie = this.movie.match(/^movie\s*:\s*(.*)/i)[1];
    }
  }

  transpose(newKey) {
    if (this.key === newKey ||  Number(newKey) === 0) {
      return this;
    }

    let transposer = new Transposer(this.key, newKey);

    let newSheet = new Sheet();
    newSheet.songName = this.songName;
    newSheet.key = transposer.getNew(this.key);
    newSheet.timeSignature = this.timeSignature;
    newSheet.movie = this.movie;

    newSheet.parts = this.parts.map(([part, lines]) => {
      let transposedLines = lines.map(([lyric, chords]) => {
        let transposedChords = chords.replace(consts.RE.CHORD, (chord) => {
          return chord.replace(chord, transposer.getNew(chord));
        });
        return [lyric, transposedChords];
      });
      return [part, transposedLines];
    });

    return newSheet;
  }

  toHtml() {
    let out = `<div class="header">
                <p>
                 <span class="song-name">${_.escape(this.songName)}</span>
                 <span> - <span>
                 <span class="key">${_.escape(this.key)}</span>
                 <span> - <span>
                 <span class="time-signature">${_.escape(this.timeSignature)}</span>
                </p>
                <p class="movie">movie: ${_.escape(this.movie ? this.movie : '')}</p>                 
              </div>`;
    this.parts.forEach(([part, lines]) => {
      let partHtml = '';
      partHtml += `<p class="part-name">${_.escape(part)}</p>`;
      lines.forEach(([lyric, chords]) => {
        partHtml += `<p class="line">
                      <span class="lyric">${_.escape(lyric)}  </span>
                      <span class="chords">${_.escape(chords)}</span>
                     </p>`;
      });
      out += `<div class="part">${partHtml}</div>`;
    });
    return out;
  }

  toString() {
    let out = `${this.songName} - ${this.key} - ${this.timeSignature} \nmovie:${this.movie ? this.movie : ' --'}\n\n`;
    this.parts.forEach(([part, lines]) => {
      out += part + '\n' + '-'.repeat(part.length) + '\n';
      lines.forEach(([lyric, chords]) => {
        out += lyric + '\t\t' + chords + '\n';
      });
      out += '\n';
    });
    return out;
  }
}

export default Sheet;