
const { default: test } = require('ava'); // eslint-disable-line ava/use-test
const { default: PQueue } = require('p-queue');

class UpstreamTestError extends Error {
	constructor(error) {
		super('An error occurred in an upstream test');
		this.name = 'UpstreamTestError';

		if (error instanceof UpstreamTestError) {
			this.depth = error.depth + 1;
			this.error = error.error;
		} else {
			this.depth = 0;
			this.error = error;
		}
	}
}

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
		try {
			await Promise.all(promiseArgs);
		} catch (error) {
			throw new UpstreamTestError(error);
		}

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
