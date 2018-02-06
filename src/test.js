'use strict';

const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const Sheet = require('./sheet');

let sheet = new Sheet();
readFile('../sheets/netru-indha.txt', 'utf-8').then((file) => {
  let tr = sheet.parse(file).transpose('-1').toString();
  console.log(tr);
});