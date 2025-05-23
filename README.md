# 3D Solar System Simulation

An interactive 3D simulation of our solar system built with React and Three.js.

## Features

- Elliptical orbital mechanics with axis tilt for planets
- Interactive camera controls
  - Left-click and drag to rotate the view
  - Right-click and drag (or Shift+left-click) to pan
  - Mouse wheel to zoom in/out
  - Touch controls for mobile devices (pinch to zoom, etc.)
- Adjustable simulation speed
- Detailed planet and moon system with correct relative sizing and colors
- Saturn's rings visualization
- Star field background rendered with instanced meshes
- Shadow casting from lights for deeper realism

## Interactive Controls

- **Camera Navigation**:
  - Left-click and drag to rotate view
  - Right-click and drag (or Shift+left-click) to pan
  - Mouse wheel to zoom in/out
  - "Reset Camera" button to return to the initial view
  
- **Touch Device Controls**:
  - One finger drag to rotate view
  - Three finger drag to pan
  - Pinch to zoom
  
- **Simulation Speed**:
  - Control panel in the bottom-right corner
  - Options from pause (⏸) to 8x normal speed

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone this repository or download the source code.
2. Navigate to the project directory in your terminal.
3. Install the dependencies:

```bash
npm install
```

Or if you use yarn:

```bash
yarn install
```

### Running the Application

Start the development server:

```bash
npm start
```

If the command fails with `react-scripts: not found`, ensure that you have run
`npm install` (or `yarn install`) beforehand to download the project
dependencies.

Or with yarn:

```bash
yarn start
```

The application will open in your default web browser at `http://localhost:3000`.

## Technologies Used

- React - UI framework
- Three.js - 3D graphics library
- JavaScript ES6+ - Core programming language

## Deploying to GitHub Pages

1. In `package.json`, add a `homepage` field that points to your GitHub Pages URL. Replace `<YOUR_GITHUB_USERNAME>` with your GitHub username:

```json
"homepage": "https://<YOUR_GITHUB_USERNAME>.github.io/solar-system-sim"
```

2. Install the `gh-pages` package:

```bash
npm install --save gh-pages
```

3. Add deployment scripts to `package.json`:

```json
"predeploy": "npm run build",
"deploy": "gh-pages -d build"
```

4. Run the deploy script to publish the site:

```bash
npm run deploy
```

## License

This project is open source and available under the MIT License. 