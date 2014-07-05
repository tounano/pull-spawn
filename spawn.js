var pull = require("pull-stream");
var unwind = require("pull-unwind");
var _ = require("underscore");

var spawn = module.exports = pull.Through(function (read, throughCreator, onSpawn) {
  var ended

  return unwind()(function (end, cb) {
    if (end || ended) return cb(end || ended);
    onSpawn && onSpawn();
    cb(end, throughCreator()(function (end, cb) {
      if (end) cb(end);
      read(end, function (end, data) {
        if (end) ended = true;
        cb(end, data);
      });
    }));
  })
})