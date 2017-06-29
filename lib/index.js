'use strict';

const fs = require('fs');
const path = require('path');

const RGX = /[<>:"|?*]/; // invalid win32 chars

const isPromise = fn => fn.then !== void 0 || fn.__isPromisified__;

function wrap(fn) {
	return function () {
		const args = [].slice.call(arguments);
		return new Promise((res, rej) => fn.apply(this, args.concat((err, out) => err ? rej(err) : res(out))));
	};
}

function mkdirs(str, opts) {
	return opts.fs.mkdir(str, opts.mode).then(_ => str).catch(err => {
		if (err.code === 'ENOENT') {
			const dir = path.dirname(str);
			if (err.message.includes('null bytes') || dir === str) {
				throw err;
			}
			return mkdirs(dir, opts).then(_ => mkdirs(str, opts));
		}

		return opts.fs.stat(str).then(obj => obj.isDirectory() ? str : Promise.reject()).catch(_ => {
			throw err;
		});
	});
}

module.exports = (str, opts) => {
	opts = opts || {};

	if (process.platform === 'win32' && RGX.test(str.replace(path.parse(str).root, ''))) {
		const err = new Error(`Path contains invalid characters: ${str}`);
		err.code = 'EINVAL';
		throw err;
	}

	opts.mode = opts.mode || 0o777 & (~process.umask());

	if (opts.fs === void 0) {
		opts.fs = { stat:fs.stat, mkdir:fs.mkdir };
	}

	opts.fs.stat = isPromise(opts.fs.stat) ? opts.fs.stat : wrap(opts.fs.stat);
	opts.fs.mkdir = isPromise(opts.fs.mkdir) ? opts.fs.mkdir : wrap(opts.fs.mkdir);

	return mkdirs(path.resolve(str), opts);
};
