'use strict';

const path = require('path');

function promisify(P) {
	return fn => function () {
		const args = [].slice.call(arguments);
		return new P((res, rej) => {
			try {
				return fn.apply(this, args.concat((err, out) => err ? rej(err) : res(out)));
			} catch (err) {
				return rej(err);
			}
		});
	};
}

function mkdir(str, opts) {
	return opts.fs.mkdir(str, opts.mode).then(_ => str).catch(err => {
		if (err.code === 'ENOENT') {
			const dir = path.dirname(str);
			if (err.message.includes('null bytes') || dir === str) {
				throw err;
			}
			return mkdir(dir, opts).then(_ => mkdir(str, opts));
		}

		return opts.fs.stat(str).then(obj => obj.isDirectory() ? str : opts.Promise.reject()).catch(_ => {
			throw err;
		});
	});
}

module.exports = (str, opts) => {
	opts = opts || {};

	const P = opts.Promise || global.Promise;
	const wrap = P.promisify || promisify(P);
	const fs = opts.fs || require('fs');

	opts.fs = { stat:wrap(fs.stat), mkdir:wrap(fs.mkdir) };
	opts.mode = opts.mode || 0o777 & (~process.umask());
	opts.Promise = P;

	return mkdir(path.resolve(str), opts);
};
