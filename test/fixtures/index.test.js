
import delay from 'delay';

import test from '../..';

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

const macro3 = async (t, argument) => {
	t.is(argument, 'macro3 argument');

	t.is(await one, undefined);

	t.true(finishedTests.has('one'));
	t.is(finishedTests.size, 1);

	await randomDelay();

	finishedTests.add('two3');
};

macro3.title = () => 'two3 (macro)';

const two3 = test(macro3, 'macro3 argument');

const macro4 = async (t, argument) => {
	t.is(argument, 'macro4 argument');

	t.true(finishedTests.has('one'));
	t.true(finishedTests.has('two3'));

	await randomDelay();

	finishedTests.add('two4');
};

macro4.title = () => 'two4 (join + macro)';

const two4 = test.join(two3, macro4, 'macro4 argument');

const three1 = test.join(two1, two2, two3, two4, 'three1 (test.join)', async t => {
	t.true(finishedTests.has('one'));
	t.true(finishedTests.has('two1'));
	t.true(finishedTests.has('two2'));
	t.true(finishedTests.has('two3'));
	t.true(finishedTests.has('two4'));
	t.is(finishedTests.size, 5);
});

const three2 = test('three2 (Promise.all)', async t => {
	await Promise.all([ two1, two2, two3, two4 ]);
	t.true(finishedTests.has('one'));
	t.true(finishedTests.has('two1'));
	t.true(finishedTests.has('two2'));
	t.true(finishedTests.has('two3'));
	t.true(finishedTests.has('two4'));
	t.is(finishedTests.size, 5);
});

const throwingOne = test('throwingOne', async () => {
	await randomDelay();
	throw new Error('test error');
});

const throwingTwo = test.join(throwingOne, 'throwingTwo', t => {
	t.pass();
});

test('final', async t => {
	await t.notThrowsAsync(Promise.all([ three1, three2 ]));
	await t.throwsAsync(throwingTwo, 'An error occurred in an upstream test');

	t.pass();
});

test('unrelated', t => t.pass());
test.todo('test todo');
