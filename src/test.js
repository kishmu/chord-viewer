'use strict';

const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const Sheet = require('./sheet');

const consts = require('./consts');

let sheet = new Sheet();
readFile('../sheets/netru-indha.txt', 'utf-8').then((file) => {
  let tr = sheet.parse(file).transpose('-1').toString();
  console.log(tr);
});

// let chords = `Perc		| \\ | \\ |
// test      |F|
// EFP EE		| Fm7 FAug | AbM7 |
// Perc		| \\ | . . (.Bb.B | C) \\ | . . (.Eb.E| F) 

// Gtr+Bass	| \\ | . . .Cm7.% | x2
// 		| \\ | . . (str) | x2

// Strings		| Bbm7.Am7-5.Db/Ab  .Fm7 | x2
// 		| Bbm7.Am7-5.Db/Ab .Eb|.E.Fm  .Eb.E|.Fm  .Eb.E.Fm|

// Lala		| C | Fm | x2
// -------------`;
// let lines = chords.split('\n');

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

// console.log(lines.join('\n'));