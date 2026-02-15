// Load Three.js module and make it globally extensible
import * as THREENamespace from '../../node_modules/three/build/three.module.js';

// We need to make THREE extensible for the legacy control scripts
// Create a proxy that allows property assignment
const THREE = new Proxy(THREENamespace, {
  get(target, prop) {
    return target[prop];
  },
  set(target, prop, value) {
    // Allow setting new properties on a separate object
    if (!THREE._extensions) THREE._extensions = {};
    THREE._extensions[prop] = value;
    return true;
  }
});

// Make THREE globally available
window.THREE = THREE;

// Dynamically load and execute the control script
const response = await fetch('../../node_modules/three/examples/js/controls/OrbitControls.js');
const scriptText = await response.text();
eval(scriptText);

// Export the control classes from our extensions
export const OrbitControls = THREE._extensions?.OrbitControls || window.THREE.OrbitControls;
export const MapControls = THREE._extensions?.MapControls || window.THREE.MapControls;
export { THREE };
