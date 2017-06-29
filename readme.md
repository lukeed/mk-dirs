# mk-dirs [![Build Status: OSX & Linux](https://travis-ci.org/lukeed/mk-dirs.svg?branch=master)](https://travis-ci.org/lukeed/mk-dirs) [![Build Status: Windows](https://ci.appveyor.com/api/projects/status/syt3wy6mx7dsia2d/branch/master?svg=true)](https://ci.appveyor.com/project/lukeed/mk-dirs/branch/master)

> Make a directory and its parents, if necessary.

This is a fast and lightweight alternative to [`mkdirp`](https://github.com/substack/node-mkdirp). It's also heavily inspired by [`make-dir`](https://github.com/sindresorhus/make-dir).

Check out [Comparisons](#comparisons) for more info!


## Install

```
$ npm install --save mk-dirs
```


## Usage

```js
$ pwd
/Users/hello/world
$ tree
.
```

```js
const mkdir = require('mk-dirs');

mkdir('foo/bar/baz').then(path => {
  console.log(path);
  //=> '/Users/hello/world/foo/bar/baz'
});
```

```
$ tree
.
└── foo
    └── bar
        └── baz
```

#### Multiple Directories

```js
const mkdir = require('mk-dirs');

Promise.all([
  mkdir('cat/cow'),
  mkdir('foo/bar/baz')
]).then(paths => {
  console.log(paths);
  //=> [ '/Users/hello/world/cat/cow', '/Users/hello/world/foo/bar/baz' ]
});
```


## API

### mkdir(path, [options])

Returns a `Promise`, which resolves with the full path of the created directory.

#### path

Type: `string`

Directory to create.

#### options.fs

Type: `object`<br>
Default: `require('fs')`

Optionally use a custom `fs` implementation. For example [`graceful-fs`](https://github.com/isaacs/node-graceful-fs).

> **Important:** Must include `mkdir` and `stat` methods!

#### options.mode

Type: `integer`<br>
Default: `0o777 & (~process.umask())`

Directory [permissions](https://x-team.com/blog/file-system-permissions-umask-node-js/).

> **Note:** Must be in octal format!


## Comparisons

#### make-dir

* _Slightly faster_
* Doesn't re-wrap an existing Promise
* Doesn't ship with a `.sync` method
* Zero dependencies

#### mkdirp

* Promise API _(Async/await ready!)_
* Fixes many `mkdirp` issues: [#96](https://github.com/substack/node-mkdirp/pull/96) [#70](https://github.com/substack/node-mkdirp/issues/70) [#66](https://github.com/substack/node-mkdirp/issues/66)
* CI-tested on macOS, Linux, and Windows
* Doesn't ship with a `.sync` method
* Doesn't bundle a CLI


## Benchmarks

:bulb: Please consider that these benchmarks are _largely affected_ by System behavior! In other words, the time it takes your OS to create a directory _is never consistent_.

```
mk-dirs
  --> 3,768 ops/sec ±1.95% (72 runs sampled)
make-dir
  --> 3,527 ops/sec ±4.28% (64 runs sampled)
mkdirp
  --> 3,305 ops/sec ±2.56% (67 runs sampled)
```


## License

MIT © [Luke Edwards](https://lukeed.com)
