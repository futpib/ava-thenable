
import delay from 'delay';

import test from '../..';

const randomDelay = () => delay(Math.random() * 100);

const concurrency = 1;

test.configureThenable({
	concurrency,
});

let runningTests = 0;

const macro = async (t, f) => {
	runningTests++;

	await f();
	t.true(runningTests <= concurrency);
	await randomDelay();

	runningTests--;
};

test('one', macro, randomDelay);
test('two', macro, randomDelay);
test('three', macro, randomDelay);
