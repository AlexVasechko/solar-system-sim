import React from 'react';

const ResetCameraButton = ({ onClick }) => {
  const buttonStyle = {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    padding: '8px 16px',
    backgroundColor: '#333',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    zIndex: 1000, // Ensure it's above the canvas
  };

  return (
    <button style={buttonStyle} onClick={onClick}>
      Reset Camera
    </button>
  );
};

export default ResetCameraButton;
