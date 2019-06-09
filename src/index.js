import { promisify } from 'util';
import { existsSync, mkdir, stat } from 'fs';
import { join, normalize, parse, resolve } from 'path';

const statp = promisify(stat);
const mkdirp = promisify(mkdir);

export default async function (str, opts={}) {
	if (process.platform === 'win32' && /[<>:"|?*]/.test(str.replace(parse(str).root, ''))) {
		let err = new Error('EINVAL: invalid characters');
		err.code = 'EINVAL';
		err.path = str;
		throw err;
	}

	let cwd = resolve(opts.cwd || '.');
	let seg, stats, mode = opts.mode || 0o777 & (~process.umask());
	let arr = resolve(cwd, normalize(str)).replace(cwd, '').split(/\/|\\/);

	for (seg of arr) {
		cwd = join(cwd, seg);
		if (existsSync(cwd)) {
			stats = await statp(cwd);
			if (!stats.isDirectory()) {
				let err = new Error('ENOTDIR: not a directory');
				err.code = 'ENOTDIR';
				err.path = cwd;
				throw err;
			}
		} else {
			await mkdirp(cwd, mode);
		}
	}

	return cwd;
}
