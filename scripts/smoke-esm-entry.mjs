/* eslint-env node */
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

try {
    const { Piece, generateMoves, RectBoard } = await import(
        pathToFileURL(path.join(ROOT, "build", "index.js")).href,
    );
    if (typeof Piece !== "function" || typeof generateMoves !== "function") {
        throw new Error("build/index.js missing expected exports");
    }
    if (typeof RectBoard !== "function") {
        throw new Error("build/index.js missing RectBoard");
    }
    console.log("smoke-esm-entry: import(build/index.js) OK");
} catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`smoke-esm-entry: ${message}`);
    process.exit(1);
}
