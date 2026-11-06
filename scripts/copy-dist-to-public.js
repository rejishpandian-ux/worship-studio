import { cp, mkdir, rm, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    ".."
);

const dist = path.join(root, "dist");
const publicDir = path.join(root, "public");
const publicAssets = path.join(publicDir, "assets");

// Remove old compiled assets only
await rm(publicAssets, { recursive: true, force: true });

// Preserve the existing backgrounds folder
await mkdir(publicDir, { recursive: true });

// Copy the compiled frontend
await copyFile(
    path.join(dist, "index.html"),
    path.join(publicDir, "index.html")
);

await cp(
    path.join(dist, "assets"),
    publicAssets,
    { recursive: true }
);

console.log("Frontend files copied to public successfully!");