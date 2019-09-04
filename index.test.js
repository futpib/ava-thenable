
import {
	sortBy,
	prop,
} from 'sanctuary';

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

	t.is(results.count, 12);
	t.is(results.pass, 9);
	t.is(results.fail, 3);
	t.is(results.todo, 1);

	const failureNames = results.failures.map(fail => ({
		name: fail.name,
		diag: {
			name: fail.diag.name,
			message: fail.diag.message,
		},
	}));

	t.deepEqual(sortBy(prop('name'))(failureNames), [
		{
			name: 'throwingOne',
			diag: {
				name: 'AssertionError',
				message: 'Rejected promise returned by test',
			},
		},
		{
			name: 'throwingTwo',
			diag: {
				name: 'AssertionError',
				message: 'Rejected promise returned by test',
			},
		},
	]);
});

test('concurrency.test.js', async t => {
	const avaProcess = execa('ava', [ '--tap', 'test/fixtures/concurrency.test.js' ], {
		reject: false,
	});

	const tapParser = new TapParser();
	const resultsPromise = new Promise(resolve => tapParser.on('complete', resolve));

	avaProcess.stdout.pipe(tapParser);

	const results = await resultsPromise;

	t.is(results.count, 20);
	t.is(results.pass, 20);
	t.is(results.fail, 0);
	t.is(results.todo, 0);
});

test('function-macro-arguments.test.js', async t => {
	const avaProcess = execa('ava', [ '--tap', 'test/fixtures/function-macro-arguments.test.js' ], {
		reject: false,
	});

	const tapParser = new TapParser();
	const resultsPromise = new Promise(resolve => tapParser.on('complete', resolve));

	avaProcess.stdout.pipe(tapParser);

	const results = await resultsPromise;

	t.is(results.count, 3);
	t.is(results.pass, 3);
	t.is(results.fail, 0);
	t.is(results.todo, 0);
});
