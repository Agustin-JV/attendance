export const XLSX = require('xlsx');

export const handleFile = callback => e => {
  var rABS = typeof FileReader !== 'undefined' && (FileReader.prototype || {}).readAsBinaryString;
  var files = e.target.files,
    f = files[0];
  var reader = new FileReader();
  if (files[0] !== undefined) {
    reader.onload = function(e) {
      var data = e.target.result;
      if (!rABS) data = new Uint8Array(data);
      var workbook = XLSX.read(data, { type: rABS ? 'binary' : 'array' });
      callback(workbook);
    };
    if (rABS) reader.readAsBinaryString(f);
    else reader.readAsArrayBuffer(f);
  } else {
    callback();
  }
};
