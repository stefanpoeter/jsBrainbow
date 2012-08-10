importScripts('bb-sequence.js');
importScripts('../lib/sylvester.js');
importScripts('bb-utils.js');

var running = false;

onmessage = function (event) {
  // doesn't matter what the message is, just toggle the worker
  if (running === false) {
    running = true;
    run(event.data);
  } else {
    running = false;
  }
};

function run(s) {
    var seq = Sequence(s);
    
    if (seq.toString() === '') {
        postError('Not a valid sequence.');
        running = false;
        return;
    }
    
    var res = SeqUtils(s).calcProbs();
    postMessage(res);
    running = false;
}