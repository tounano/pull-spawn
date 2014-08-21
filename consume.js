var pull = require("pull-stream");
var _ = require("underscore");
var control = require('pull-control');

var consume = module.exports = pull.Through(function (read, sink) {
  var args = _.isArray(sink) ? _.union([read], sink) : [].slice.call(arguments);
  read = args.shift(); sink = args.shift();
  if (args.length) read = consume(args)(read);
  read = control.serial()(read);

  var buffers = {main:[], consumer:[]}, ended;

  function readToBuffer(end, done) {
    if (ended) return done(ended);
    if (end && (buffers.main || buffers.consumer)) return done(end);

    read(end, function (end, data) {
      buffers.consumer && buffers.consumer.push([_.clone(end), _.clone(data)]);
      buffers.main && buffers.main.push([end, data]);
      done(end);
      if (end) ended = end;
    });
  }

  function readFromBuffer(buf) {
    var _ended, _ending
    return function next (end, cb) {
      if (end && !_ended) {
        _ended = end;
        buffers[buf] = null;
        // Notify upstream just in case
        readToBuffer(_ended, function(){});
      }
      if (_ended) return cb(_ended);

      if (buffers[buf] && buffers[buf].length){ return cb(buffers[buf][0][0], buffers[buf].shift()[1]);}
      if (_ending) return cb(_ending, cb);

      readToBuffer(end, function (end) {
        _ending = _ending || end;
        return next(end, cb);
      });
    }
  }

  var readable = readFromBuffer('main'); readable.child = sink(readFromBuffer('consumer'));

  return readable;
})