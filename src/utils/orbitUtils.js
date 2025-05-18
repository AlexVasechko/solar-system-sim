// Returns the x/z position of a body moving in an elliptical orbit.
// The calculation is independent of Three.js so it can be unit tested.
function calculateOrbitPosition(distance, angle, eccentricity = 0) {
  const r = (distance * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(angle));
  return {
    x: Math.cos(angle) * r,
    z: Math.sin(angle) * r,
  };
}

module.exports = { calculateOrbitPosition };
