import React from 'react';

const CelestialBodyInfoPanel = ({ selectedBody }) => {
  if (!selectedBody) {
    return null;
  }

  const panelStyle = {
    position: 'absolute',
    right: '20px',
    top: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '15px',
    borderRadius: '5px',
    maxWidth: '300px',
    zIndex: 1000,
    fontSize: '14px',
    lineHeight: '1.4',
    boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
    fontFamily: 'Arial, sans-serif',
  };

  const titleStyle = {
    marginTop: 0,
    color: '#4CAF50', // Greenish accent
    fontSize: '18px',
    marginBottom: '10px',
  };

  const paragraphStyle = {
    margin: '5px 0',
  };

  const strongStyle = {
    color: '#cccccc', // Lighter grey for labels
  };

  return (
    <div style={panelStyle}>
      <h3 style={titleStyle}>{selectedBody.name}</h3>
      <p style={paragraphStyle}>
        <strong style={strongStyle}>Type:</strong> {selectedBody.type}
      </p>
      {selectedBody.parentPlanet && (
        <p style={paragraphStyle}>
          <strong style={strongStyle}>Parent Planet:</strong> {selectedBody.parentPlanet}
        </p>
      )}
      <p style={paragraphStyle}>
        <strong style={strongStyle}>Diameter:</strong> {selectedBody.diameter}
      </p>
      {selectedBody.type === 'star' ? (
        <>
          <p style={paragraphStyle}>
            <strong style={strongStyle}>Rotation Period:</strong> {selectedBody.rotationPeriod}
          </p>
          <p style={paragraphStyle}>
            <strong style={strongStyle}>Temperature:</strong> {selectedBody.temperature}
          </p>
        </>
      ) : (
        <p style={paragraphStyle}>
          <strong style={strongStyle}>Orbital Period:</strong> {selectedBody.orbitalPeriod}
        </p>
      )}
      {selectedBody.temperature && selectedBody.type !== 'star' && (
        <p style={paragraphStyle}>
          <strong style={strongStyle}>Temperature:</strong> {selectedBody.temperature}
        </p>
      )}
      <p style={paragraphStyle}>{selectedBody.description}</p>
    </div>
  );
};

export default CelestialBodyInfoPanel;
