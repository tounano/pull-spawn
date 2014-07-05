var pull = require("pull-stream");
var parrot = require("pull-parrot");
var _ = require("underscore");

var observe = module.exports = pull.Through(function (read, sink) {
  var args = _.isArray(sink) ? _.union([read], sink) : [].slice.call(arguments);
  read = args.shift(); sink = args.shift();
  if (args.length) read = observe(args)(read);

  var observed = parrot(); sink(observed);

  return function(end, cb) {
    read(end, function (end, data) {
      cb(end, data);
      observed.push(end, data);
      if (end) observed.end();
    })
  }
})