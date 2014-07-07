var pull = require("pull-stream");
var consume = require("../consume");

var slowMap = pull.asyncMap( function (d, done) {
  setTimeout( function () {
    done(null, d);
  }, 1000)
})

pull(
  pull.values([1,2,3,4,5]),
  consume(
    pull(slowMap,pull.map(function (d) {return "slow" + d}), pull.log()),
    pull(pull.map(function (d) {return d*10}), pull.log())
  ),
  pull.log()
)