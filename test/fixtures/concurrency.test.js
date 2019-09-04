
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

range(0)(10).forEach(i => {
	test('test ' + i, macro);
});
