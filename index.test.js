
import delay from 'delay';

import test from '.';

const finishedTests = new Set();

const randomDelay = () => delay(Math.random() * 100);

const one = test('one', async t => {
	t.is(finishedTests.size, 0);

	await randomDelay();

	finishedTests.add('one');
});

const two1 = test('two1', async t => {
	t.is(finishedTests.size, 0);

	t.is(await one, undefined);

	t.true(finishedTests.has('one'));
	t.is(finishedTests.size, 1);

	await randomDelay();

	finishedTests.add('two1');
});

const two2 = test.join(one, 'two2', async t => {
	t.true(finishedTests.has('one'));
	t.is(finishedTests.size, 1);

	await randomDelay();

	finishedTests.add('two2');
});

test.join(two1, two2, 'three', async t => {
	t.true(finishedTests.has('one'));
	t.true(finishedTests.has('two1'));
	t.true(finishedTests.has('two2'));
	t.is(finishedTests.size, 3);
});

test('unrelated', t => t.pass());
test.todo('test todo');
