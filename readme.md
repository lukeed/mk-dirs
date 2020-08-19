# mk-dirs [![CI](https://github.com/lukeed/mk-dirs/workflows/CI/badge.svg)](https://github.com/lukeed/mk-dirs/actions) [![codecov](https://badgen.now.sh/codecov/c/github/lukeed/mk-dirs)](https://codecov.io/gh/lukeed/mk-dirs)

> A tiny (381B to 419B) utility to make a directory and its parents, recursively

This is a `Promise`-based utility that recursively creates directories. It's effectively `mkdir -p` for Node.js.

This module is a fast and lightweight alternative to [`mkdirp`](https://github.com/substack/node-mkdirp). Check out [Comparisons](#comparisons) for more info!

> **Notice:** Node v10.12.0 includes the `recursive` option for [`fs.mkdir`](https://nodejs.org/api/fs.html#fs_fs_mkdir_path_options_callback) and [`fs.mkdirSync`](https://nodejs.org/api/fs.html#fs_fs_mkdirsync_path_options).

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

## Modes

There are two "versions" of `mk-dirs` available:

#### "async"
> **Node.js:** >= 8.x<br>
> **Size (gzip):** 419 bytes<br>
> **Availability:** [CommonJS](https://unpkg.com/mk-dirs/dist/index.js), [ES Module](https://unpkg.com/mk-dirs/dist/index.mjs)

This is the primary/default mode. It makes use of `async`/`await` and [`util.promisify`](https://nodejs.org/api/util.html#util_util_promisify_original).

#### "sync"
> **Node.js:** >= 6.x<br>
> **Size (gzip):** 381 bytes<br>
> **Availability:** [CommonJS](https://unpkg.com/mk-dirs/sync/index.js), [ES Module](https://unpkg.com/mk-dirs/sync/index.mjs)

This is the opt-in mode, ideal for scenarios where `async` usage cannot be supported.<br>In order to use it, simply make the following changes:

```diff
-import { mkdir } from 'mk-dirs';
+import { mkdir } from 'mk-dirs/sync';
```


## Usage

```sh
$ pwd
# /Users/hello/world

$ tree
# .
```

```js
import { mkdir } from 'mk-dirs';
import { resolve } from 'path';

// Async/await
try {
  let output = await mkdir('foo/bar/baz');
  console.log(output); //=> "/Users/hello/world/foo/bar/baz"
} catch (err) {
  //
}

// Promises
mkdir('foo/bar/baz').then(output => {
  console.log(output); //=> "/Users/hello/world/foo/bar/baz"
}).catch(err => {
  //
});

// Using `cwd` option
let dir = resolve('foo/bar');
await mkdir('hola/mundo', { cwd: dir });
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

- [`totalist`](https://github.com/lukeed/totalist) - A tiny (195B to 224B) utility to recursively list all (total) files in a directory
- [`escalade`](https://github.com/lukeed/escalade) - A tiny (183B) and fast utility to ascend parent directories
- [`premove`](https://github.com/lukeed/premove) – A tiny (247B) utility to remove items recursively

## License

MIT © [Luke Edwards](https://lukeed.com)
