# mk-dirs [![build status](https://badgen.now.sh/github/status/lukeed/mk-dirs)](https://github.com/lukeed/mk-dirs/actions) [![codecov](https://badgen.now.sh/codecov/c/github/lukeed/mk-dirs)](https://codecov.io/gh/lukeed/mk-dirs)

> A tiny (420B) utility to make a directory and its parents, recursively

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

```sh
$ pwd
# /Users/hello/world

$ tree
# .
```

```js
import mkdirs from 'mk-dirs';
import { resolve } from 'path';

// Async/await
try {
  let output = await mkdirs('foo/bar/baz');
  console.log(output); //=> "/Users/hello/world/foo/bar/baz"
} catch (err) {
  //
}

// Promises
mkdirs('foo/bar/baz').then(output => {
  console.log(output); //=> "/Users/hello/world/foo/bar/baz"
}).catch(err => {
  //
});

// Using `cwd` option
let dir = resolve('foo/bar');
await mkdirs('hola/mundo', { cwd: dir });
//=> "/Users/hello/world/foo/bar/hola/mundo"
```

```sh
$ tree
# .
# └── foo
#     └── bar
#         └── baz
#         └── hola
#             └── mundo
```


## API

### mkdir(path, options={})
Returns: `Promise<String>`

Returns a `Promise`, which resolves with the full path (string) of the created directory.<br>
Any file system errors will be thrown and must be caught manually.

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

***Versus `make-dir`***

* `mk-dirs` is slightly faster
* ...has zero dependencies
* ...does offer `cwd` option
* ...does not re-wrap an existing Promise
* ...does not ship with a `sync` method
* ...does not allow custom `fs` option

***Versus `mkdirp`***

* `mk-dirs` is _much_ faster
* ...has zero dependencies
* ...is a Promise-based API
* ...is `async`/`await` ready!
* ...is tested on macOS, Linux, and Windows
* ... has fixes for `mkdirp` issues: [#96](https://github.com/substack/node-mkdirp/pull/96), [#70](https://github.com/substack/node-mkdirp/issues/70), [#66](https://github.com/substack/node-mkdirp/issues/66)
* ...includes a `cwd` option
* ...does not ship with a `sync` method
* ...does not allow custom `fs` option
* ...does not bundle a CLI runtime

## Related

- [`premove`](https://github.com/lukeed/premove) – A tiny (247B) utility to remove items recursively

## License

MIT © [Luke Edwards](https://lukeed.com)
