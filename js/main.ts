// Import dependencies that will be bundled
import * as THREE from "three";
import { DragControls } from "three/examples/jsm/controls/DragControls.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js";

// Make THREE globally available and attach controls to it
(window as any).THREE = THREE;
(window as any).THREE.DragControls = DragControls;
(window as any).THREE.OrbitControls = OrbitControls;
(window as any).THREE.TransformControls = TransformControls;
(window as any).STLExporter = STLExporter;
(window as any).OBJExporter = OBJExporter;

// Import other dependencies
import * as Tweakpane from "tweakpane";
(window as any).Tweakpane = Tweakpane;

import $ from "jquery";
(window as any).$ = $;
(window as any).jQuery = $;

// Note: GoldenLayout is loaded via script tag (UMD library) 
// Note: rawflate is loaded via script tag in HTML
// Note: Original application scripts (CascadeViewHandles.js, CascadeView.js, CascadeMain.js) 
// are loaded via script tags in HTML to preserve their global scope functions

