'use strict';

import fs from 'fs';
import util from 'util';
const readFile = util.promisify(fs.readFile);
import Sheet from './sheet';

let sheet = new Sheet();
let song = '/Users/kalvaik/Google Drive/Shows/motta-maadi.txt';

// readFile('../sheets/nee-oru-kadal.txt', 'utf-8').then((file) => {
// readFile('/Users/kalvaik/Google Drive/Shows/oho-megam.txt', 'utf-8').then((file) => {
readFile(song, 'utf-8').then((file) => {
  let tr = sheet.parse(file).transpose('-4').toString();
  console.log(tr);
});