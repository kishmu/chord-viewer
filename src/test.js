'use strict';

const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const Sheet = require('./sheet');

let sheet = new Sheet();
readFile('../sheets/nee-oru-kadal.txt', 'utf-8').then((file) => {
  console.log(sheet.parse(file).transpose('-3').toString());
});
