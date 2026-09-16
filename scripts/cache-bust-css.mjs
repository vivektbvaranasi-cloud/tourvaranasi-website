import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const cssDir = path.join(root, "assets", "css");
const versions = new Map();

if (fs.existsSync(cssDir)) {
  for (const name of fs.readdirSync(cssDir)) {
    if (!name.endsWith(".css")) continue;
    const file = path.join(cssDir, name);
    const hash = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex").slice(0, 10);
    versions.set(name, hash);
  }
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === ".git" || ent.name === "node_modules") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) { walk(p); continue; }
    if (!ent.isFile() || !p.endsWith(".html")) continue;
    let html = fs.readFileSync(p, "utf8");
    const before = html;
    html = html.replace(/\/assets\/css\/([^"\'?]+\.css)(?:\?v=[^"\']*)?/g, (full, name) => {
      const v = versions.get(name);
      return v ? "/assets/css/" + name + "?v=" + v : full;
    });
    if (html !== before) fs.writeFileSync(p, html);
  }
}

walk(root);
console.log("CSS cache-busting applied to " + versions.size + " stylesheets.");
