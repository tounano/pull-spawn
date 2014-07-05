var _ = require("underscore");

module.exports = _.extend(require("./spawn"),{
  fork: require("./fork"),
  observe: require("./observe"),
  isolate: require("./isolate")
})