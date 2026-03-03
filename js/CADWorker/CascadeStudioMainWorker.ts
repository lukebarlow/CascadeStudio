// Declare globals from other scripts
declare var oc: any;
declare var opencascade: any;
declare var opentype: { load: (url: string, callback: (err: any, font: any) => void) => void };
declare function importScripts(...urls: string[]): void;
declare function ShapeToMesh(shape: any, maxDeviation: number, edgeHashes: Record<string, number>, faceHashes: Record<string, number>): any;
declare function ForEachEdge(shape: any, callback: (index: number, edge: any) => void): Record<string, number>;
declare function ForEachFace(shape: any, callback: (index: number, face: any) => void): void;
declare var argCache: Record<string, any>;
declare var usedHashes: Record<string, string>;
declare var opNumber: number;
declare var currentOp: string;
declare var currentLineNumber: number;

// Define the persistent global variables
var oc = null, externalShapes: Record<string, any> = {}, sceneShapes: any[] = [],
  GUIState: Record<string, any>, fullShapeEdgeHashes: Record<string, number> = {}, fullShapeFaceHashes: Record<string, number> = {},
  currentShape: any;

// Capture Logs and Errors and forward them to the main thread
let realConsoleLog   = console.log;
let realConsoleError = console.error;
console.log = function (message: any) {
  //postMessage({ type: "log", payload: message });
  setTimeout(() => { postMessage({ type: "log", payload: message }); }, 0);
  realConsoleLog.apply(console, arguments as any);
};
console.error = function (err: any, url?: any, line?: any, colno?: any, errorObj?: any) {
  postMessage({ type: "resetWorking" });
  setTimeout(() => {
    err.message = "INTERNAL OPENCASCADE ERROR DURING GENERATE: " + err.message;
    throw err; 
  }, 0);
  
  realConsoleError.apply(console, arguments as any);
}; // This is actually accessed via worker.onerror in the main thread

// Import the set of scripts we'll need to perform all the CAD operations
importScripts(
  '../../node_modules/three/build/three.min.js',
  './CascadeStudioStandardLibrary.js',
  './CascadeStudioShapeToMesh.js',
  '../../vendor/opencascade.js/dist/opencascade.wasm.js',
  '../../vendor/opentype.js/dist/opentype.min.js',
  '../../vendor/potpack/index.js');

// Preload the Various Fonts that are available via Text3D
var preloadedFonts = ['../../fonts/Roboto.ttf',
  '../../fonts/Papyrus.ttf', '../../fonts/Consolas.ttf'];
var fontCache: Record<string, any> = {};
preloadedFonts.forEach((fontURL) => {
  opentype.load(fontURL, function (err: any, font: any) {
    if (err) { console.log(err); }
    let fontName = fontURL.split("./fonts/")[1].split(".ttf")[0];
    fontCache[fontName] = font;
  });
});

// Load the full Open Cascade Web Assembly Module
var messageHandlers: Record<string, (payload: any) => any> = {};
new opencascade({
  locateFile(path: string) {
    if (path.endsWith('.wasm')) {
      return "../../vendor/opencascade.js/dist/opencascade.wasm.wasm";
    }
    return path;
  }
}).then((openCascade: any) => {
  // Register the "OpenCascade" WebAssembly Module under the shorthand "oc"
  oc = openCascade;

  // Ping Pong Messages Back and Forth based on their registration in messageHandlers
  onmessage = function (e: MessageEvent) {
    let response = messageHandlers[e.data.type](e.data.payload);
    if (response) { postMessage({ "type": e.data.type, payload: response }); };
  }

  // Initial Evaluation after everything has been loaded...
  postMessage({ type: "startupCallback" });
});

/** This function evaluates `payload.code` (the contents of the Editor Window)
 *  and sets the GUI State. */
function Evaluate(payload: { code: string; GUIState: Record<string, any> }): void {
  opNumber = 0; // This keeps track of the progress of the evaluation
  GUIState = payload.GUIState;
  try {
    eval(payload.code);
  } catch (e) {
    setTimeout(() => {
      (e as Error).message = "Line " + currentLineNumber + ": "  + currentOp + "() encountered  " + (e as Error).message;
      throw e;
    }, 0);
  } finally {
    postMessage({ type: "resetWorking" });
    // Clean Cache; remove unused Objects
    for (let hash in argCache) {
      if (!usedHashes.hasOwnProperty(hash)) { delete argCache[hash]; } }
    usedHashes = {};
  }
}
messageHandlers["Evaluate"] = Evaluate;

/**This function accumulates all the shapes in `sceneShapes` into the `TopoDS_Compound` `currentShape`
 * and converts it to a mesh (and a set of edges) with `ShapeToMesh()`, and sends it off to be rendered. */
function combineAndRenderShapes(payload: { maxDeviation?: number; sceneOptions: any }): [any, any] | undefined {
  // Initialize currentShape as an empty Compound Solid
  currentShape     = new oc.TopoDS_Compound();
  let sceneBuilder = new oc.BRep_Builder();
  sceneBuilder.MakeCompound(currentShape);
  let fullShapeEdgeHashes: Record<string, number> = {}; let fullShapeFaceHashes: Record<string, number> = {};
  postMessage({ "type": "Progress", "payload": { "opNumber": opNumber++, "opType": "Combining Shapes" } });

  // If there are sceneShapes, iterate through them and add them to currentShape
  if (sceneShapes.length > 0) {
    for (let shapeInd = 0; shapeInd < sceneShapes.length; shapeInd++) {
      if (!sceneShapes[shapeInd] || !sceneShapes[shapeInd].IsNull || sceneShapes[shapeInd].IsNull()) {
        console.error("Null Shape detected in sceneShapes; skipping: " + JSON.stringify(sceneShapes[shapeInd]));
        continue;
      }
      if (!sceneShapes[shapeInd].ShapeType) {
        console.error("Non-Shape detected in sceneShapes; " +
          "are you sure it is a TopoDS_Shape and not something else that needs to be converted to one?");
        console.error(JSON.stringify(sceneShapes[shapeInd]));
        continue;
      }

      // Scan the edges and faces and add to the edge list
      Object.assign(fullShapeEdgeHashes, ForEachEdge(sceneShapes[shapeInd], (index, edge) => { }));
      ForEachFace(sceneShapes[shapeInd], (index, face) => {
        fullShapeFaceHashes[face.HashCode(100000000)] = index;
      });

      sceneBuilder.Add(currentShape, sceneShapes[shapeInd]);
    }

    // Use ShapeToMesh to output a set of triangulated faces and discretized edges to the 3D Viewport
    postMessage({ "type": "Progress", "payload": { "opNumber": opNumber++, "opType": "Triangulating Faces" } });
    let facesAndEdges = ShapeToMesh(currentShape,
      payload.maxDeviation||0.1, fullShapeEdgeHashes, fullShapeFaceHashes);
    sceneShapes = [];
    postMessage({ "type": "Progress", "payload": { "opNumber": opNumber, "opType": "" } }); // Finish the progress
    return [facesAndEdges, payload.sceneOptions];
  } else {
    console.error("There were no scene shapes returned!");
  }
  postMessage({ "type": "Progress", "payload": { "opNumber": opNumber, "opType": "" } });
}
messageHandlers["combineAndRenderShapes"] = combineAndRenderShapes;

// Import the File IO Utilities
importScripts('./CascadeStudioFileUtils.js');
