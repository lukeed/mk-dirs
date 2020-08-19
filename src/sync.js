import { existsSync, mkdirSync, statSync } from 'fs';
import { join, normalize, parse, resolve } from 'path';

function throws(code, msg, path) {
	let err = new Error(code + ': ' + msg);
	err.code=code; err.path=path;
	throw err;
}

export function mkdir(str, opts={}) {
	if (process.platform === 'win32' && /[<>:"|?*]/.test(str.replace(parse(str).root, ''))) {
		throws('EINVAL', 'invalid characters', str);
	}

	let cwd = resolve(opts.cwd || '.');
	let seg, mode = opts.mode || 0o777 & (~process.umask());
	let arr = resolve(cwd, normalize(str)).replace(cwd, '').split(/\/|\\/);

	for (seg of arr) {
		cwd = join(cwd, seg);
		if (existsSync(cwd)) {
			if (!statSync(cwd).isDirectory()) {
				throws('ENOTDIR', 'not a directory', cwd);
			}
		} else {
			mkdirSync(cwd, mode);
		}
	}

	return cwd;
}
