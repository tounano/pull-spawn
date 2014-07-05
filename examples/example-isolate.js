var pull = require("pull-stream");
var isolate = require("../").isolate;

pull(
  pull.values([1, 2, 3]),
  isolate(function (num) {
    console.log("isolating", num);
    return pull(
      pull.map(function (n) {return n * num})
    )
  }),
  pull.log()
)