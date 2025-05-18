const assert = require('assert');
const { calculateOrbitPosition } = require('../src/utils/orbitUtils');

function testCircularOrbit() {
  const pos = calculateOrbitPosition(10, 0, 0);
  assert.strictEqual(Math.round(pos.x), 10);
  assert.strictEqual(Math.round(pos.z), 0);
}

function testEllipticalOrbit() {
  const angle = Math.PI;
  const e = 0.5;
  const distance = 10;
  const r = (distance * (1 - e * e)) / (1 + e * Math.cos(angle));
  const pos = calculateOrbitPosition(distance, angle, e);
  assert.ok(Math.abs(pos.x + r) < 1e-6);
  assert.ok(Math.abs(pos.z) < 1e-6);
}

module.exports = [testCircularOrbit, testEllipticalOrbit];
