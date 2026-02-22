// Entry point for CascadeStudio
// Imports all dependencies and initializes the application
import $ from "jquery";
import { appState, messageHandlers } from "../js/MainPage/state.js";
import { initialize, saveProject, loadProject, loadFiles, clearExternalFiles } from "../js/MainPage/CascadeMain.js";

/** Dynamically injects a script tag and resolves when it has loaded */
function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve();
        script.onerror = (e) => reject(e);
        document.head.appendChild(script);
    });
}

/** Loads Monaco editor using its AMD require mechanism */
async function loadMonaco(): Promise<void> {
    (window as any).require = { paths: { vs: "node_modules/monaco-editor/min/vs" } };
    await loadScript("./node_modules/monaco-editor/min/vs/loader.js");
    return new Promise((resolve) => {
        (window as any).require(["vs/editor/editor.main"], () => resolve());
    });
}

async function main() {
    // Make jQuery available globally for GoldenLayout
    (window as any).$ = $;
    (window as any).jQuery = $;

    // Load GoldenLayout BEFORE Monaco to avoid AMD conflicts
    // (Monaco sets window.define; GoldenLayout must load before that happens)
    await loadScript("./node_modules/golden-layout/dist/goldenlayout.min.js");

    // Load rawflate vendor library (used for URL encode/decode)
    await loadScript("./vendor/rawflate/rawdeflate.js");
    await loadScript("./vendor/rawflate/rawinflate.js");

    // Load Monaco editor
    await loadMonaco();

    // Create the CAD kernel Web Worker
    const worker = new Worker("./js/CADWorker/CascadeStudioMainWorker.js");
    appState.cascadeStudioWorker = worker;
    // window.workerWorking is kept on window for Playwright test compatibility
    window.workerWorking = false;

    // Route messages from the worker to registered handlers
    worker.onmessage = function (e) {
        if (e.data.type in messageHandlers) {
            const response = messageHandlers[e.data.type](e.data.payload);
            if (response) {
                worker.postMessage({ type: e.data.type, payload: response });
            }
        }
    };

    // Wire up navigation bar buttons via event listeners
    document.getElementById("nav-save-project")!.addEventListener("mouseup", () => saveProject());
    document.getElementById("nav-load-project")!.addEventListener("mouseup", () => loadProject());
    document.getElementById("nav-save-step")!.addEventListener("mouseup", () => appState.threejsViewport?.saveShapeSTEP());
    document.getElementById("nav-save-stl")!.addEventListener("mouseup", () => appState.threejsViewport?.saveShapeSTL());
    document.getElementById("nav-save-obj")!.addEventListener("mouseup", () => appState.threejsViewport?.saveShapeOBJ());
    document.getElementById("nav-import-files")!.addEventListener("change", () => loadFiles());
    document.getElementById("nav-clear-files")!.addEventListener("mouseup", () => clearExternalFiles());

    // Register service worker for offline/PWA support
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("service-worker.js").then(
            (registration) => { registration.update(); },
            () => { console.log("Could not register Cascade Studio for offline use!"); }
        );
    }

    // Start the application
    initialize();
}

main().catch((err) => {
    console.error("CascadeStudio failed to initialize:", err);
});

