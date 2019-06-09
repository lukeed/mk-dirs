const test = require('tape');
const premove = require('premove');
const { join, resolve } = require('path');
const { existsSync, statSync, writeFileSync } = require('fs');
const mkdirs = require('../dist');

const isWin = process.platform === 'win32';

test.Test.prototype.exists = function (str, bool, msg) {
	msg = msg || (bool ? '~> (setup) exists' : '~> does not exist');
	this.is(existsSync(str), bool, msg);
};

test.Test.prototype.valid = function (dir, mode) {
	let stats = statSync(dir);
	mode = isWin ? 0o666 : (mode || 0o777 & (~process.umask()));
	this.is(stats.mode & 0o777, mode, '~> correct mode');
	this.true(stats.isDirectory(), '~> is a directory');
};

test('exports', t => {
	t.is(typeof mkdirs, 'function', 'a function');
	t.end();
});

test('single (relative)', async t => {
	let out = await mkdirs('foo');
	t.is(out, resolve('foo'), '~> returns the absolute file path');

	t.exists(out, true, '~> filepath exists');
	t.valid(out);

	await premove(out);
	t.exists(out, false, 'cleanup');

	t.end();
});

test('single (absolute)', async t => {
	let str = resolve('bar');
	let out = await mkdirs(str);
	t.is(out, str, '~> returns the absolute file path');

	t.exists(out, true, '~> filepath exists');
	t.valid(out);

	await premove(out);
	t.exists(out, false, 'cleanup');

	t.end();
});

test('nested create / recursive', async t => {
	let dir = resolve('./foo');

	let out = await mkdirs('./foo/bar/baz');
	t.exists(out, true, '~> filepath exists');
	t.valid(out);

	await premove(dir);
	t.exists(dir, false, 'cleanup');

	t.end();
});

test('option: mode', async t => {
	let mode = 0o744;
	let out = await mkdirs('hello', { mode });

	t.exists(out, true, '~> filepath exists');
	t.valid(out, mode);

	await premove(out);
	t.exists(out, false, 'cleanup');

	t.end();
});

test('option: cwd', async t => {
	let dir = resolve('foobar');
	let str = resolve('foobar/foo/bar');

	let out = await mkdirs('foo/bar', { cwd:dir });
	t.is(out, str, '~> returns the absolute file path');

	t.exists(out, true, '~> filepath exists');
	t.valid(out);

	await premove(dir);
	t.exists(dir, false, 'cleanup');

	t.end();
});

test('partially exists: directory', async t => {
	let foo = resolve('foobar');
	let dir = await mkdirs('foobar/baz');
	let out = await mkdirs('hello/world', { cwd: dir });
	let str = resolve('foobar/baz/hello/world');

	t.is(out, str, '~> returns the absolute file path');

	t.exists(out, true, '~> filepath exists');
	t.valid(out);

	await premove(foo);
	t.exists(foo, false, 'cleanup');

	t.end();
});

test('partially exists: file', async t => {
	t.plan(9);

	let foo = resolve('foobar');
	let file = join(foo, 'bar');

	let dir = await mkdirs(foo);
	t.exists(dir, true, '~> (setup) dir exists');

	// create "foobar/bar" as a file
	writeFileSync(file, 'asd');
	t.exists(file, true, '~> (setup) file exists');

	try {
		await mkdirs('foobar/bar/hello');
	} catch (err) {
		t.true(err instanceof Error, 'throws Error');
		t.is(err.message, 'ENOTDIR: not a directory', '~> message');
		t.is(err.code, 'ENOTDIR', '~> code');
		t.is(err.path, file, '~> path');
	}

	t.exists('foobar/bar/hello', false, '~> did not create "hello" dir');
	t.exists('foobar/bar', true, '~> file still remains');

	await premove(foo);
	t.exists(foo, false, 'cleanup');
});

test('path with null bytes', async t => {
	t.plan(5);

	let dir = resolve('hello');
	let str = resolve('hello/bar\u0000baz');

	try {
		await mkdirs(str);
	} catch (err) {
		t.true(err instanceof Error, 'throws Error');
		t.is(err.code, 'ERR_INVALID_ARG_VALUE', '~> code');
		t.true(err.message.includes('null bytes'), '~> message');
	}

	t.exists(dir, true, '~> created "hello" base directory');

	await premove(dir);
	t.exists(dir, false, 'cleanup');
});

if (isWin) {
	// assume the `o:\` drive doesn't exist on Windows
	test('handles non-existent root', async t => {
		try {
			await mkdirs('o:\\foo');
		} catch (err) {
			t.pass('throws');
			t.is(err.code, 'ENOENT');
			t.true(/no such file or directory/.test(err.message));
		}
		t.end();
	});

	test('(windows) invalid pathname', async t => {
		try {
			t.plan(4);
			await mkdirs('foo"bar');
		} catch (err) {
			t.true(err instanceof Error, 'throws Error');
			t.is(err.message, 'EINVAL: invalid characters', '~> message');
			t.is(err.path, 'foo"bar', '~> path');
			t.is(err.code, 'EINVAL', '~> code');
		}
	});
}
