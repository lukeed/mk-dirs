'use strict';

const join = require('path').join;
const stats = require('fs').statSync;
const write = require('fs').writeFileSync;
const graceful = require('graceful-fs');
const Promise = require('bluebird');
const tempy = require('tempy');
const test = require('tape');
const fn = require('../lib');

const co = Promise.coroutine;
const isDir = str => stats(str).isDirectory();
const getFixture = _ => join(tempy.directory(), 'foo/bar/baz');
const assertDir = (t, dir, mode) => {
	mode = mode || 0o777 & (~process.umask());
	(process.platform === 'win32') && (mode = 0o666);
	t.is(stats(dir).mode & 0o777, mode);
	t.true(isDir(dir));
};

test('main', co(function * (t) {
	const dir = getFixture();
	const out = yield fn(dir);
	t.true(out.length > 0);
	assertDir(t, out);
	t.end();
}));

test('`fs` option', co(function * (t) {
	const dir = getFixture();
	yield fn(dir, { fs:graceful });
	assertDir(t, dir);
	t.end();
}));

test('`mode` option', co(function * (t) {
	const mode = 0o744;
	const dir = getFixture();
	yield fn(dir, { mode });
	assertDir(t, dir, mode);

	// Ensure it's writable
	yield fn(dir);
	assertDir(t, dir, mode);
	t.end();
}));

test('dir exists', co(function * (t) {
	const dir = yield fn(tempy.directory());
	t.true(dir.length > 0);
	assertDir(t, dir);
	t.end();
}));

test('file exits', co(function * (t) {
	const fp = tempy.file();
	write(fp, '');
	try {
		yield fn(fp);
	} catch (err) {
		t.pass('throws');
		t.is(err.code, 'EEXIST');
	}
	t.end();
}));

test('root dir', co(function * (t) {
	const dir = yield fn('/');
	t.true(dir.length > 0);
	assertDir(t, dir);
	t.end();
}));

test('race two', co(function * (t) {
	const dir = getFixture();
	yield Promise.all([fn(dir), fn(dir)]);
	assertDir(t, dir);
	t.end();
}));

test('race many', co(function * (t) {
	const dir = getFixture();
	const all = [];

	for (let i = 0; i < 100; i++) {
		all.push(fn(dir));
	}

	yield Promise.all(all);
	assertDir(t, dir);
	t.end();
}));

test('handles null bytes in path', co(function * (t) {
	const dir = join(tempy.directory(), 'foo\u0000bar');
	try {
		yield fn(dir);
	} catch (err) {
		t.pass('throws');
		t.is(err.code, 'ENOENT');
		t.true(/null bytes/.test(err.message));
	}
	t.end();
}));

test('handles invalid path chars (win32)', co(function * (t) {
	// We do this to please `nyc`
	const platform = process.platform;
	Object.defineProperty(process, 'platform', { value:'win32' });

	const dir = join(tempy.directory(), 'foo"bar');

	try {
		yield fn(dir);
	} catch (err) {
		t.pass('throws');
		t.is(err.code, 'EINVAL');
		t.true(/invalid characters/.test(err.message));
	}

	Object.defineProperty(process, 'platform', { value:platform });
	t.end();
}));

if (process.platform === 'win32') {
	// We assume the `o:\` drive doesn't exist on Windows
	test('handles non-existent root', co(function * (t) {
		try {
			yield fn('o:\\foo');
		} catch (err) {
			t.pass('throws');
			t.is(err.code, 'ENOENT');
			t.true(/no such file or directory/.test(err.message));
		}
		t.end();
	}));
}
