
const { default: test } = require('ava'); // eslint-disable-line ava/use-test

const mapFunctions = (f, args) => args.map(x => {
	if (typeof x === 'function') {
		return f(x);
	}

	return x;
});

const enhancedTest = Object.assign((...args) => new Promise(resolve => {
	test(...mapFunctions(testImplementation => async (...args) => {
		const returnValue = await testImplementation(...args);
		resolve(returnValue);
		return returnValue;
	}, args));
}), test);

enhancedTest.join = (...args) => {
	const firstNonPromiseArgumentIndex = args.findIndex(x => !x || typeof x.then !== 'function');
	const promiseArgs = args.slice(0, firstNonPromiseArgumentIndex);
	const otherArgs = args.slice(firstNonPromiseArgumentIndex);

	return enhancedTest(...mapFunctions(testImplementation => async (...args) => {
		await Promise.all(promiseArgs);
		return testImplementation(...args);
	}, otherArgs));
};

module.exports = enhancedTest;
