import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const versions = new Map();

function addDir(urlPrefix, diskDir, ext) {
  const dir = path.join(root, ...diskDir);
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(ext)) continue;
    const file = path.join(dir, name);
    const hash = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex").slice(0, 10);
    versions.set(urlPrefix + name, hash);
  }
}

addDir("/assets/css/", ["assets","css"], ".css");
addDir("/assets/js/", ["assets","js"], ".js");

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === ".git" || ent.name === "node_modules") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) { walk(p); continue; }
    if (!ent.isFile() || !p.endsWith(".html")) continue;

    let html = fs.readFileSync(p, "utf8");
    const before = html;

    html = html.replace(/\/assets\/(?:css|js)\/[^"'?]+\.(?:css|js)(?:\?v=[^"']*)?/g, (full) => {
      const clean = full.replace(/\?v=.*/, "");
      const v = versions.get(clean);
      return v ? clean + "?v=" + v : full;
    });

    if (html !== before) fs.writeFileSync(p, html);
  }
}

walk(root);
console.log("Static asset cache-busting applied to " + versions.size + " CSS/JS files.");
