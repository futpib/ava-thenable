
import test from 'ava';

import execa from 'execa';

test('index.test.js', async t => {
	const { stdout } = await execa('ava', [ '--tap', 'test/fixtures/index.test.js' ], {
		reject: false,
	});
	const results = stdout
		.split('\n')
		.filter(Boolean)
		.filter(line => line.startsWith('ok') || line.startsWith('not ok'))
		.map(line => line.split(' - '))
		.reduce((accumulator, [ result, testName ]) => {
			if (result.startsWith('ok')) {
				accumulator.passed.push(testName);
			} else {
				accumulator.failed.push(testName);
			}

			return accumulator;
		}, { passed: [], failed: [] });

	results.passed.sort();
	results.failed.sort();

	t.deepEqual(results, {
		passed: [
			'one',
			'two2',
			'two1',
			'two3 (macro)',
			'two4 (join + macro)',
			'three',
			'unrelated',
		].sort(),

		failed: [
			'test todo # TODO',
			'throwingOne',
			'throwingTwo',
		].sort(),
	});
});
