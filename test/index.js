const test = require('tape');
const fn = require('../lib');

test('title', t => {
	t.is(fn('unicorns'), 'unicorns & rainbows');
});
