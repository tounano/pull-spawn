var pull = require("pull-stream");

var observe = require("../observe");

var slowMap = pull.asyncMap( function (d, done) {
  setTimeout( function () {
    done(null, d);
  }, 1000)
})

pull(
  pull.values([1,2,3,4,5]),
  observe(
    pull(pull.map(function (d) {return d*10}), pull.log()),
    pull(slowMap,pull.map(function () {return "observed"}), pull.log())
  ),
  pull.log()
)