// atracdenc Web Worker — ATRAC3 encoding via Emscripten WASM
// Ported from Web MiniDisc Pro (asivery/webminidisc)
// This is a classic worker (not ESM) because it uses importScripts.

/* eslint-disable no-restricted-globals */
var Module = null;

self.onmessage = function (ev) {
  var action = ev.data.action;

  if (action === 'init') {
    // Load atracdenc.js from the same directory via importScripts
    importScripts(new URL('atracdenc.js', self.location.href).href);

    // atracdenc.js defines a global Module factory function
    self.Module().then(function (m) {
      Module = m;
      if (Module.setLogger) {
        Module.setLogger(function (msg, stream) {
          console.log('[atracdenc ' + stream + ']', msg);
        });
      }
      self.postMessage({ action: 'init' });
    });
  } else if (action === 'encode') {
    var bitrate = ev.data.bitrate;
    var data = ev.data.data;
    var inWavFile = 'inWavFile.wav';
    var outAt3File = 'outAt3File.aea';
    var dataArray = new Uint8Array(data);

    // Write WAV input to Emscripten virtual filesystem
    Module.FS.writeFile(inWavFile, dataArray);

    // Run atracdenc: encode WAV → ATRAC3 AEA container
    Module.callMain(['-e', 'atrac3', '-i', inWavFile, '-o', outAt3File, '--bitrate', bitrate]);

    // Read output file, skip the 96-byte AEA header to get raw ATRAC3 frames
    var fileStat = Module.FS.stat(outAt3File);
    var size = fileStat.size;
    var tmp = new Uint8Array(size - 96);
    var fd = Module.FS.open(outAt3File, 'r');
    Module.FS.read(fd, tmp, 0, tmp.length, 96);
    Module.FS.close(fd);

    // Cleanup Emscripten FS
    Module.FS.unlink(inWavFile);
    Module.FS.unlink(outAt3File);

    var result = tmp.buffer;
    self.postMessage({ action: 'encode', result: result }, [result]);
  }
};
