const assert = require('assert');
const processKey = require('../src/utils/keyboardProcessor');

function testDebugToggle() {
  let state = { debugMode: false, showPerformance: false, timeScale: 1, savedSpeed: 1 };
  state = processKey(state, { key: 'd' });
  assert.strictEqual(state.debugMode, true, 'Debug should toggle on');
  state = processKey(state, { key: 'D' });
  assert.strictEqual(state.debugMode, false, 'Debug should toggle off');
}

function testPerformanceToggle() {
  let state = { debugMode: false, showPerformance: false, timeScale: 1, savedSpeed: 1 };
  state = processKey(state, { key: 'p' });
  assert.strictEqual(state.showPerformance, true, 'Performance should toggle on');
  state = processKey(state, { key: 'P' });
  assert.strictEqual(state.showPerformance, false, 'Performance should toggle off');
}

function testPauseResume() {
  let state = { debugMode: false, showPerformance: false, timeScale: 1, savedSpeed: 1 };
  state = processKey(state, { key: ' ', code: 'Space' });
  assert.strictEqual(state.timeScale, 0, 'Time should pause');
  assert.strictEqual(state.savedSpeed, 1, 'Saved speed should store previous value');
  state = processKey(state, { key: ' ', code: 'Space' });
  assert.strictEqual(state.timeScale, 1, 'Time should resume to saved speed');
}

function testIncreaseDecrease() {
  let state = { debugMode: false, showPerformance: false, timeScale: 1, savedSpeed: 1 };
  state = processKey(state, { key: '+' });
  assert.strictEqual(state.timeScale, 2, 'Speed should increase to next preset');
  state = processKey(state, { key: '-' });
  assert.strictEqual(state.timeScale, 1, 'Speed should decrease to next preset');
}

module.exports = [
  testDebugToggle,
  testPerformanceToggle,
  testPauseResume,
  testIncreaseDecrease,
];
