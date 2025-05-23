import React from 'react';

const InstructionsOverlay = () => {
  const instructionStyle = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    padding: '10px 15px',
    borderRadius: '8px',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    maxWidth: '280px',
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    lineHeight: '1.6',
  };

  const titleStyle = {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#4CAF50', // A greenish accent
  };

  const listStyle = {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
  };

  const listItemStyle = {
    marginBottom: '5px',
  };

  return (
    <div style={instructionStyle}>
      <div style={titleStyle}>Controls & Navigation</div>
      <ul style={listStyle}>
        <li style={listItemStyle}><strong>Left-Click:</strong> Select celestial body</li>
        <li style={listItemStyle}><strong>Right-Click & Drag:</strong> Rotate camera</li>
        <li style={listItemStyle}><strong>Mouse Wheel:</strong> Zoom in/out</li>
        <li style={listItemStyle}><strong>Middle-Click & Drag:</strong> Pan camera</li>
        <li style={listItemStyle}><strong>Touch & Drag:</strong> Rotate camera</li>
        <li style={listItemStyle}><strong>Pinch:</strong> Zoom in/out</li>
        <li style={listItemStyle}><strong>Three-Finger Drag:</strong> Pan camera</li>
      </ul>
    </div>
  );
};

export default InstructionsOverlay;
