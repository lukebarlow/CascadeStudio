import * as THREE from '../../node_modules/three/build/three.module.js';

// Make THREE globally available for the control script
window.THREE = THREE;

// Import the control script
await import('../../node_modules/three/examples/js/controls/OrbitControls.js');

// Export the control classes
export const OrbitControls = THREE.OrbitControls;
export const MapControls = THREE.MapControls;
