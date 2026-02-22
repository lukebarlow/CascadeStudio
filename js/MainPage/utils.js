// Utility functions shared across modules

/** Opens a native file save/open picker dialog */
export async function getNewFileHandle(desc, mime, ext, open = false) {
    const options = {
        types: [{
            description: desc,
            accept: { [mime]: ['.' + ext] },
        }],
    };
    if (open) {
        return await window.showOpenFilePicker(options);
    } else {
        return await window.showSaveFilePicker(options);
    }
}

/** Writes contents to a file handle */
export async function writeFile(fileHandle, contents) {
    const writable = await fileHandle.createWritable();
    await writable.write(contents);
    await writable.close();
}

/** Downloads data as a file via a temporary anchor element */
export async function downloadFile(data, name, mime, ext) {
    const blob = new Blob([data], { type: mime });
    const a = document.createElement("a");
    a.download = name + "." + ext;
    a.style.display = "none";
    a.href = window.URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(a.href);
}

/** Returns true if item is indexable like an array */
export function isArrayLike(item) {
    return (
        Array.isArray(item) ||
        (!!item &&
            typeof item === "object" &&
            item.hasOwnProperty("length") &&
            typeof item.length === "number" &&
            item.length > 0 &&
            (item.length - 1) in item
        )
    );
}

/** Decodes a base64 and zipped string to the original version of that string.
 *  Requires window.RawDeflate to be loaded (via vendor/rawflate scripts) before calling. */
export function decode(string) { return window.RawDeflate.inflate(window.atob(decodeURIComponent(string))); }

/** Encodes a string to a base64 and zipped version of that string.
 *  Requires window.RawDeflate to be loaded (via vendor/rawflate scripts) before calling. */
export function encode(string) { return encodeURIComponent(window.btoa(window.RawDeflate.deflate(string))); }
