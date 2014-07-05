var pull = require("pull-stream");
var _ = require("underscore");
var unwind = require("pull-unwind");
var parrotStream = require("pull-parrot");


var isolate = module.exports = pull.Through(function (read, throughCreator) {
  return unwind()(function (end, cb) {
    read(end, function (end, data) {
      if (end) return cb(end);
      var parrot = parrotStream();
      var d = _.clone(data);
      parrot.push(_.clone(end), d);
      parrot.end();

      cb(end, throughCreator(d)(parrot));
    });
  })
})