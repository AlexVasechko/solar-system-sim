const tests = require('./keyboardProcessor.test.js');

let failures = 0;
for (const test of tests) {
  try {
    test();
    console.log(`\u2714 ${test.name}`);
  } catch (err) {
    failures++;
    console.error(`\u2718 ${test.name}`);
    console.error(err.message);
  }
}

if (failures > 0) {
  console.error(`${failures} test(s) failed`);
  process.exit(1);
} else {
  console.log('All tests passed');
}
