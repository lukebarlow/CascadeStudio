import * as THREE from '../../node_modules/three/build/three.module.js';

// Make THREE globally available for the exporter script
window.THREE = THREE;

// Import the exporter script
await import('../../node_modules/three/examples/js/exporters/OBJExporter.js');

// Export the exporter class
export const OBJExporter = THREE.OBJExporter;
