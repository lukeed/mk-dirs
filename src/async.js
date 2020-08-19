import { promisify } from 'util';
import { existsSync, mkdir as mk, stat } from 'fs';
import { join, normalize, parse, resolve } from 'path';

const statp = promisify(stat);
const mkdirp = promisify(mk);

function throws(code, msg, path) {
	let err = new Error(code + ': ' + msg);
	err.code=code; err.path=path;
	throw err;
}

export async function mkdir(str, opts={}) {
	if (process.platform === 'win32' && /[<>:"|?*]/.test(str.replace(parse(str).root, ''))) {
		throws('EINVAL', 'invalid characters', str);
	}

	let cwd = resolve(opts.cwd || '.');
	let seg, stats, mode = opts.mode || 0o777 & (~process.umask());
	let arr = resolve(cwd, normalize(str)).replace(cwd, '').split(/[\\\/]+/);

	for (seg of arr) {
		cwd = join(cwd, seg);
		if (existsSync(cwd)) {
			stats = await statp(cwd);
			if (!stats.isDirectory()) {
				throws('ENOTDIR', 'not a directory', cwd);
			}
		} else {
			await mkdirp(cwd, mode);
		}
	}

	return cwd;
}
