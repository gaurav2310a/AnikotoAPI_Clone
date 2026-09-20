import fs from "node:fs";
import path from "node:path";

const root = path.resolve("node_modules");
let patched = 0;

function walk(dir) {
  if (!fs.existsSync(dir)) return;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === ".bin") continue;
      walk(full);
      continue;
    }

    if (entry.name !== "package.json" || !full.includes("iconv-lite")) continue;

    try {
      const pkg = JSON.parse(fs.readFileSync(full, "utf8"));

      if (pkg.name !== "iconv-lite" || !pkg.browser) continue;

      // Wrangler's Workers bundler can resolve iconv-lite's browser mapping
      // to a non-callable streams shim. Removing that mapping lets
      // iconv-lite use the Workers Node.js stream compatibility API.
      delete pkg.browser;

      fs.writeFileSync(full, JSON.stringify(pkg, null, 2) + "\n");
      patched++;
      console.log("[cloudflare] patched", full);
    } catch {
      // Ignore unrelated package.json files that cannot be parsed.
    }
  }
}

walk(root);
console.log(`[cloudflare] iconv-lite packages patched: ${patched}`);
