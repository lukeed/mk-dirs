const { join } = require('path');
const { stat, mkdir } = require('fs');
const { Suite } = require('benchmark');
const Bluebird = require('bluebird');
const Table = require('cli-table2');
const makeDir = require('make-dir');
const mkdirp = require('mkdirp');
const tempy = require('tempy');
const fn = require('../lib');

const bench = new Suite();
const wrap = Bluebird.promisify;
const fs = { stat:wrap(stat), mkdir:wrap(mkdir) };
const getDir = _ => join(tempy.directory(), 'foo/bar/baz');

bench
	.add('mkdirp', () => mkdirp(getDir()))
	.add('make-dir', () => makeDir(getDir()))
	.add('mk-dirs (bluebird)', () => fn(getDir(), { fs }))
	.add('mk-dirs', () => fn(getDir()))
	.on('cycle', e => console.log(String(e.target)))
	.on('complete', function () {
		console.log('Fastest is ' + this.filter('fastest').map('name'));

		const tbl = new Table({
			head: ['Name', 'Mean time', 'Ops/sec', 'Diff']
		});

		let prev, diff;

		bench.forEach(el => {
			if (prev) {
				diff = ((el.hz - prev) * 100 / prev).toFixed(2) + '% faster';
			} else {
				diff = 'N/A'
			}
			prev = el.hz;
			tbl.push([el.name, el.stats.mean, el.hz.toLocaleString(), diff])
		});
		console.log(tbl.toString());
	})
	.run({ async:true });
