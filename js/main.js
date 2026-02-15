// Main ESM entry point for Cascade Studio
import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from './lib/OrbitControls.js';
import { DragControls } from './lib/DragControls.js';
import { TransformControls } from './lib/TransformControls.js';
import { STLExporter } from './lib/STLExporter.js';
import { OBJExporter } from './lib/OBJExporter.js';

// Make THREE globally available
window.THREE = THREE;

// Export for global access
export { THREE, OrbitControls, DragControls, TransformControls, STLExporter, OBJExporter };
