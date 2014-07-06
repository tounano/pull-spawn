var pull = require("pull-stream");
var parrot = require("pull-parrot");
var _ = require("underscore");

var observe = module.exports = pull.Through(function (read, sink) {
  var args = _.isArray(sink) ? _.union([read], sink) : [].slice.call(arguments);
  read = args.shift(); sink = args.shift();
  if (args.length) read = observe(args)(read);

  var observed = parrot(); readable.observed = sink(observed);

  function readable (end, cb) {
    read(end, function (end, data) {
      observed.push(_.clone(end), _.clone(data));
      cb(end, data);
      if (end) observed.end();
    })
  }

  return readable;
})