# pull-spawn

Spawn pull streams into substreams.

## Usage

### spawn(throughCreator, ?onSpawn)

Creates an isolated execution context around the through stream. If the through stream ends with an error, `spawn` will
recreate the through stream.

####args

*  `throughCreator` - A callback that should return the through stream.
*  `onSpawn` - Optional callback to trigger when spawns.

####example

```js
var pull = require("pull-stream");
var spawn = require("pull-spawn");

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
```

### spawn.isolate(throughCreator)

Similar to `spawn`, but will `spawn` a `through` on each read. Usefull, when you want to extract one read into multiple
writes.

`throughCreator` will get `data` as argument. `data` is the read result.

#### example

```js
var pull = require("pull-stream");
var isolate = require("pull-spawn").isolate;

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
```

### spawn.fork(sink)

Forks readable stream into another `Sink` other than the main sink.

Respects back-pressure: reads from upstream, only once both sinks are ready to read.

The forked stream will abort if an error ocurred on the main stream. The main stream won't abort if the forked stream
was aborted.

#### args

`sink`, as it sounds, should be a sink stream.

```js
pull(
  pull.count(10),
  spawn.fork(pull.drain(console.error)),
  pull.log()
)
```

You can specify several sinks:

```js
pull(
  pull.count(10),
  spawn.fork(
    sink1,
    sink2
  ),
  pull.log()
)
```

Which is eventually similar to:

```js
pull(
  pull.count(10),
  spawn.fork(sink1)
  spawn.fork(sink2)
  pull.log()
)
```

`sink` can also be an array of sinks.

#### example

```js
var pull = require("pull-stream");

var fork = require("pull-spawn").fork;

var slowMap = pull.asyncMap( function (d, done) {
  setTimeout( function () {
    done(null, d);
  }, 1000)
})

pull(
  pull.values([1,2,3,4,5]),
  fork(
    pull(pull.map(function (d) {return d*10}), pull.log()),
    pull(slowMap, pull.map(function () {return "slow fork"}), pull.log())
  ),
  pull.log()
)
```

#### advanced usage: fork a through

```js
var read = someSourceStream;
var s = spawn.fork(through)(read);

// main stream
pull(
  s,
  pull.log();
)

// forked stream
pull(
  s.child,
  pull.log();
)
```

As you can see, if you fork a pull-stream manually, you'll be able to access `pipedStream.child` and read from it.

### spawn.observe(sink)

`observe` is exactly the same as `fork`, with one difference. It would read as fast as the main sink reads. Which means
that if the observer is a slow sink, it's data will be buffered.

If the observer is faster than the main sink, it will wait the main sink to read.

Everything else, is exactly the same (including the `child` property).

#### example

```js
var pull = require("pull-stream");

var observe = require("pull-spawn").observe;

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
```

### spawn.consume(sink)

Similar to `observe` and `fork` with one main difference. It will pull data from upstream as fast as the fastes consumer
 (could be the main consumer, or the alternative consumer). The stream will abort consuming data after the last consumer
 was terminated.

## install

With [npm](https://npmjs.org) do:

```
npm install pull-spawn
```

## license

MIT