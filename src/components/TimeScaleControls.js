import React from 'react';

const TimeScaleControls = ({ timeScale, onTimeScaleChange }) => {
  const controlsDivStyle = {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '10px',
    borderRadius: '4px',
    zIndex: 1000,
    fontFamily: 'Arial, sans-serif',
  };

  const titleStyle = {
    fontWeight: 'bold',
    marginBottom: '8px',
    textAlign: 'center',
    fontSize: '14px',
  };

  const buttonContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    justifyContent: 'center',
  };

  const buttonStyle = (isActive) => ({
    backgroundColor: isActive ? '#4CAF50' : '#555',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 10px',
    cursor: 'pointer',
    minWidth: '45px',
    fontSize: '14px',
    fontWeight: 'bold',
  });

  const keyboardInfoStyle = {
    marginTop: '8px',
    fontSize: '12px',
    textAlign: 'center',
  };

  const speeds = [
    { label: '⏸', value: 0 },
    { label: '0.25x', value: 0.25 },
    { label: '0.5x', value: 0.5 },
    { label: '1x', value: 1 },
    { label: '2x', value: 2 },
    { label: '4x', value: 4 },
    { label: '8x', value: 8 },
  ];

  return (
    <div style={controlsDivStyle}>
      <div style={titleStyle}>Simulation Speed</div>
      <div style={buttonContainerStyle}>
        {speeds.map((speed) => (
          <button
            key={speed.value}
            style={buttonStyle(speed.value === timeScale)}
            onClick={() => onTimeScaleChange(speed.value)}
          >
            {speed.label}
          </button>
        ))}
      </div>
      <div style={keyboardInfoStyle}>
        Space: Pause/Resume
        <br />
        +/-: Change Speed
      </div>
    </div>
  );
};

export default TimeScaleControls;
