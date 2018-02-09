'use strict';
import Sheet from './sheet';

let transposeRangeChange = (evt) => {
  // update value
  document.getElementById('transpose-value').innerHTML = evt.target.value;
};

let transpose = (evt) => {
  if (!window.sheet) {
    return;
  }
  document.getElementById('chord-panel').innerHTML = window.sheet.transpose(evt.target.value).toHtml();
};

let loadSheet = (evt) => {
  let file = evt.target.files[0];
  if (!file) {
    console.log('no files chosen');
    return;
  }
  if (!file.type.match('text/plain')) {
    console.log('invalid file type');
    return;
  }

  // open the file as text
  let reader = new FileReader();
  let sheet = window.sheet = new Sheet();
  reader.readAsText(file);
  reader.onloadend = () => {
    document.getElementById('chord-panel').innerHTML = sheet.parse(reader.result).toHtml();
  };
  reader.onerror = () => {
    console.log('error reading file');
  };

  // reset transpose range
  document.getElementById('transpose-range').value = 0;
  document.getElementById('transpose-value').innerHTML = '0';

};

document.getElementById('transpose-range').addEventListener('change', transpose, false);
document.getElementById('transpose-range').addEventListener('input', transposeRangeChange, false); // for every step
document.getElementById('file').addEventListener('change', loadSheet, false);