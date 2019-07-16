
import test from 'ava';

import execa from 'execa';

import TapParser from 'tap-parser';

test('index.test.js', async t => {
	const avaProcess = execa('ava', [ '--tap', 'test/fixtures/index.test.js' ], {
		reject: false,
	});

	const tapParser = new TapParser();
	const resultsPromise = new Promise(resolve => tapParser.on('complete', resolve));

	avaProcess.stdout.pipe(tapParser);

	const results = await resultsPromise;

	t.is(results.count, 11);
	t.is(results.pass, 8);
	t.is(results.fail, 3);
	t.is(results.todo, 1);

	const failureNames = results.failures.map(fail => fail.name);

	t.deepEqual(failureNames.sort(), [
		'throwingOne',
		'throwingTwo',
	]);
});
