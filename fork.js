var pull = require("pull-stream");
var _ = require("underscore");

var fork = module.exports = pull.Through(function (read, sink) {
  var args = _.isArray(sink) ? _.union([read], sink) : [].slice.call(arguments);
  read = args.shift(); sink = args.shift();
  if (args.length) read = fork(args)(read);

  var ended, forkEnded, pullReads = [], pullCbs = [], forkCbs = [], output = []

  readable.child = sink(function (end, cb) {
    forkEnded = forkEnded || end;
    if (forkEnded) return cb(forkEnded);

    forkCbs.push(cb);
    drain();
  });

  function drain() {
    while (output.length && pullCbs.length && (forkCbs.length || forkEnded))
      (function (end, data, cb, forkCb) {
        forkCb && forkCb(_.clone(end), _.clone(data));
        cb(end, data);
      })(output[0][0], output.shift()[1], pullCbs.shift(), forkCbs.shift());

    while (pullReads.length && (forkCbs.length || forkEnded))
      (function (end, cb) {
        read(end || ended, function (_end, data) {
          if (_end) {
            ended = true;
            forkEnded = true;
          }

          output.push([_end, data]);
          pullCbs.push(cb);

          return drain();
        })
      })(pullReads[0][0], pullReads.shift()[1]);
  }

  function readable (end, cb) {
    pullReads.push([end, cb]);
    drain();
  }

  return readable;
});