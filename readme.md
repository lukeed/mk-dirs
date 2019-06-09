# mk-dirs [![Build Status](https://badgen.now.sh/travis/lukeed/mk-dirs)](https://travis-ci.org/lukeed/mk-dirs)

> Make a directory and its parents, recursively

This is a `Promise`-based utility that recursively creates directories.<br>
It's effectively `mkdir -p` for Node.js

This module is a fast and lightweight alternative to [`mkdirp`](https://github.com/substack/node-mkdirp).<br>
Check out [Comparisons](#comparisons) for more info!

> **Important:** Requires Node 8.x or later – uses `async` functions.

Available in these formats:

* **ES Module**: `dist/index.mjs`
* **CommonJS**: `dist/index.js`

> **Note:**<br>
> Are you using Node.js 10.12 or later?<br>
> If so, You should use the built-in [`fs.mkdir`](https://nodejs.org/api/fs.html#fs_fs_mkdir_path_options_callback) instead!

  ```js
  const { mkdir } = require('fs');
  const { promisify } = require('util');

  const mkdirp = promisify(mkdir);

  function mkdirs(str, opts={}) {
    return mkdirp(str, { ...opts, recursive:true });
  }
  ```


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

### mkdir(path, options={})

Returns a `Promise`, which resolves with the full path of the created directory.

#### path
Type: `String`

The directory to create.

#### options.cwd
Type: `String`<br>
Default: `.`

The directory to resolve your `path` from.<br>
Defaults to the `process.cwd()` – aka, the directory that your command is run within.

#### options.mode
Type: `Number`<br>
Default: `0o777 & (~process.umask())`

The directory [permissions](https://x-team.com/blog/file-system-permissions-umask-node-js/) to set.

> **Important:** Must be in octal format!


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

:bulb: Please consider that these benchmarks are _largely affected_ by system behavior!<br>
In other words, the time it takes your OS to create a directory _is never consistent_.

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
