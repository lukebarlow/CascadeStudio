import * as THREE from '../../node_modules/three/build/three.module.js';

// Make THREE globally available for the control script
window.THREE = THREE;

// Import the control script
await import('../../node_modules/three/examples/js/controls/TransformControls.js');

// Export the control classes
export const TransformControls = THREE.TransformControls;
export const TransformControlsGizmo = THREE.TransformControlsGizmo;
export const TransformControlsPlane = THREE.TransformControlsPlane;
