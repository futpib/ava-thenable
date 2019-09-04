
const { default: test } = require('ava'); // eslint-disable-line ava/use-test
const { default: PQueue } = require('p-queue');

let pQueueOptions = {};
let pQueue;

const addToPQueue = f => {
	if (!pQueue) {
		pQueue = new PQueue(pQueueOptions);
	}

	return pQueue.add(f);
};

const mapFunctions = (f, args) => args.map(x => {
	if (typeof x === 'function') {
		const mapped = f(x);
		return Object.assign(mapped, x);
	}

	return x;
});

const enhancedTest = Object.assign((...args) => {
	const testPromise = new Promise((resolve, reject) => {
		test(...mapFunctions(testImplementation => async (...args) => {
			try {
				const returnValue = await addToPQueue(() => testImplementation(...args));
				resolve(returnValue);
				return returnValue;
			} catch (error) {
				reject(error);
				throw error;
			}
		}, args));
	})
		.then( // Avoid extra unhandled rejection
			value => ({ status: 'fulfilled', value }),
			value => ({ status: 'rejected', value }),
		);

	return {
		then(mapFulfilled, mapRejected) {
			return testPromise.then(({ status, value }) => {
				if (status === 'fulfilled') {
					mapFulfilled(value);
				} else {
					mapRejected(value);
				}
			});
		},
	};
}, test);

enhancedTest.join = (...args) => {
	const firstNonPromiseArgumentIndex = args.findIndex(x => !x || typeof x.then !== 'function');
	const promiseArgs = args.slice(0, firstNonPromiseArgumentIndex);
	const otherArgs = args.slice(firstNonPromiseArgumentIndex);

	return enhancedTest(...mapFunctions(testImplementation => async (...args) => {
		await Promise.all(promiseArgs);
		return testImplementation(...args);
	}, otherArgs));
};

enhancedTest.configureThenable = ({
	concurrency = Infinity,
}) => {
	pQueueOptions = {
		concurrency,
	};
};

module.exports = enhancedTest;
