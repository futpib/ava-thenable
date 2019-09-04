
import delay from 'delay';
import { range } from 'sanctuary';

import test from '../..';

const randomDelay = () => delay(Math.random() * 100);

const concurrency = 3;

test.configureThenable({
	concurrency,
});

let runningTests = 0;

const macro = async t => {
	runningTests++;

	t.true(runningTests <= concurrency);
	await randomDelay();

	runningTests--;
};

const testPromises = [];

testPromises[0] = range(0)(5).map(i => test('test 0 ' + i, macro));
testPromises[1] = range(0)(5).map(i => test.join(testPromises[0][i], 'test 1 ' + i, macro));
testPromises[2] = range(0)(5).map(i => test.join(testPromises[1][i], 'test 2 ' + i, macro));
testPromises[3] = range(0)(5).map(i => test.join(testPromises[2][i], 'test 3 ' + i, macro));
