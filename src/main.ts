// Import dependencies that will be bundled
import * as THREE from "three";
import "three/examples/jsm/controls/DragControls.js";
import "three/examples/jsm/controls/OrbitControls.js";
import "three/examples/jsm/controls/TransformControls.js";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js";

// Make THREE globally available
(window as any).THREE = THREE;
(window as any).STLExporter = STLExporter;
(window as any).OBJExporter = OBJExporter;

// Import other dependencies
import * as Tweakpane from "tweakpane";
(window as any).Tweakpane = Tweakpane;

import $ from "jquery";
(window as any).$ = $;
(window as any).jQuery = $;

import GoldenLayout from "golden-layout";
(window as any).GoldenLayout = GoldenLayout;

// rawflate is vendored - will be loaded separately
// These scripts are already loaded in index.html before this bundle

// Import original application scripts
import "../js/MainPage/CascadeViewHandles.js";
import "../js/MainPage/CascadeView.js";
import "../js/MainPage/CascadeMain.js";
