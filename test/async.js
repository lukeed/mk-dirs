import { test } from 'uvu';
import premove from 'premove';
import * as assert from 'uvu/assert';
import { existsSync, statSync, writeFileSync } from 'fs';
import { join, resolve, parse } from 'path';
import mkdirs from  '../src/async';

const isWin = process.platform === 'win32';

function exists(str, bool, msg) {
	assert.is(existsSync(str), bool, msg);
}

function isValid(dir, mode) {
	let stats = statSync(dir);
	mode = isWin ? 0o666 : (mode || 0o777 & (~process.umask()));
	assert.is(stats.mode & 0o777, mode, '~> correct mode');
	assert.ok(stats.isDirectory(), '~> is a directory');
}

// ---

test('exports', () => {
	assert.type(mkdirs, 'function');
});

test('single (relative)', async () => {
	let out = await mkdirs('foo');
	assert.is(out, resolve('foo'), '~> returns the absolute file path');

	exists(out, true);
	isValid(out);

	await premove(out);
	exists(out, false);
});

test('single (absolute)', async () => {
	let str = resolve('bar');
	let out = await mkdirs(str);
	assert.is(out, str, '~> returns the absolute file path');

	exists(out, true);
	isValid(out);

	await premove(out);
	exists(out, false);
});

test('nested create / recursive', async () => {
	let dir = resolve('./foo');

	let out = await mkdirs('./foo/bar/baz');
	exists(out, true);
	isValid(out);

	await premove(dir);
	exists(dir, false);
});

test('option: mode', async () => {
	let mode = 0o744;
	let out = await mkdirs('hello', { mode });

	exists(out, true);
	isValid(out, mode);

	await premove(out);
	exists(out, false);
});

test('option: cwd', async () => {
	let dir = resolve('foobar');
	let str = resolve('foobar/foo/bar');

	let out = await mkdirs('foo/bar', { cwd:dir });
	assert.is(out, str, '~> returns the absolute file path');

	exists(out, true);
	isValid(out);

	await premove(dir);
	exists(dir, false);
});

test('partially exists: directory', async () => {
	let foo = resolve('foobar');
	let dir = await mkdirs('foobar/baz');
	let out = await mkdirs('hello/world', { cwd: dir });
	let str = resolve('foobar/baz/hello/world');

	assert.is(out, str, '~> returns the absolute file path');

	exists(out, true);
	isValid(out);

	await premove(foo);
	exists(foo, false);
});

test('partially exists: file', async () => {
	let foo = resolve('foobar');
	let file = join(foo, 'bar');

	let dir = await mkdirs(foo);
	exists(dir, true, '~> (setup) dir exists');

	// create "foobar/bar" as a file
	writeFileSync(file, 'asd');
	exists(file, true, '~> (setup) file exists');

	try {
		await mkdirs('foobar/bar/hello');
		assert.unreachable('should have thrown');
	} catch (err) {
		assert.instance(err, Error, 'throws Error');
		assert.is(err.message, 'ENOTDIR: not a directory', '~> message');
		assert.is(err.code, 'ENOTDIR', '~> code');
		assert.is(err.path, file, '~> path');
	}

	exists('foobar/bar/hello', false, '~> did not create "hello" dir');
	exists('foobar/bar', true, '~> file still remains');

	await premove(foo);
	exists(foo, false);
});

test('path with null bytes', async () => {
	let dir = resolve('hello');
	let str = resolve('hello/bar\u0000baz');

	try {
		await mkdirs(str);
		assert.unreachable('should have thrown');
	} catch (err) {
		assert.instance(err, Error, 'throws Error');
		assert.ok(/ENOENT|ERR_INVALID_ARG_VALUE/.test(err.code), '~> code');
		assert.ok(err.message.includes('null bytes'), '~> message');
	}

	exists(dir, true, '~> created "hello" base directory');

	await premove(dir);
	exists(dir, false);
});

test('should handle invalid pathname', async () => {
	let prev = process.platform;
	Object.defineProperty(process, 'platform', { value: 'win32' });

	try {
		await mkdirs('foo"bar');
		assert.unreachable('should have thrown');
	} catch (err) {
		assert.instance(err, Error, 'throws Error');
		assert.is(err.message, 'EINVAL: invalid characters');
		assert.is(err.path, 'foo"bar');
		assert.is(err.code, 'EINVAL');
	}

	Object.defineProperty(process, 'platform', { value: prev });
});

if (isWin) {
	// assume the `o:\` drive doesn't exist on Windows
	test('handles non-existent root', async () => {
		let path = 'o:\\foo';

		try {
			await mkdirs(path);
			assert.unreachable('should have thrown');
		} catch (err) {
			assert.is(err.code, 'EINVAL');
			console.log('DEBUG:', err);
			// assert.ok(/no such file or directory/.test(err.message));
		}
	});
}

test.run();
