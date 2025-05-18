const speeds = [0, 0.25, 0.5, 1, 2, 4, 8];

function processKey(state, event) {
  let { debugMode, showPerformance, timeScale, savedSpeed } = state;
  const key = event.key;
  const code = event.code;

  if (key === 'd' || key === 'D') {
    debugMode = !debugMode;
  } else if (key === 'p' || key === 'P') {
    showPerformance = !showPerformance;
  } else if (key === ' ' || code === 'Space') {
    if (timeScale !== 0) {
      savedSpeed = timeScale;
      timeScale = 0;
    } else {
      timeScale = savedSpeed;
    }
  } else if (key === '+' || key === '=' || key === 'Add') {
    let currentIndex = speeds.indexOf(timeScale);
    if (currentIndex < 0) {
      for (let i = 0; i < speeds.length; i++) {
        if (speeds[i] > timeScale) {
          currentIndex = i - 1;
          break;
        }
      }
    }

    if (currentIndex < speeds.length - 1) {
      timeScale = speeds[currentIndex + 1];
    }
  } else if (key === '-' || key === '_' || key === 'Subtract') {
    let currentIndex = speeds.indexOf(timeScale);
    if (currentIndex < 0) {
      for (let i = speeds.length - 1; i >= 0; i--) {
        if (speeds[i] < timeScale) {
          currentIndex = i + 1;
          break;
        }
      }
    }

    if (currentIndex > 0) {
      timeScale = speeds[currentIndex - 1];
    }
  }

  return { debugMode, showPerformance, timeScale, savedSpeed };
}

module.exports = processKey;
