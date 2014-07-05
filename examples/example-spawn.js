var pull = require("pull-stream");
var spawn = require("../spawn");

pull(
  pull.count(20),
  spawn( function () {
    return function (read) {
      return function (end, cb) {
        if (Math.round(Math.random() * 3) == 0) { return cb(new Error("random error")); }
        read(end, cb);
      }
    }
  }, function() {console.log("spawning")}),
  pull.log()
)