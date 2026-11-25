import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";
import handler from "../api/index";

test("Vercel API adapter serves direct and rewritten JSON requests", async () => {
  const server = createServer(handler);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    assert(address && typeof address !== "string");
    const base = `http://127.0.0.1:${address.port}`;

    const health = await fetch(`${base}/api/health`);
    assert.equal(health.status, 200);
    assert.match(health.headers.get("content-type") ?? "", /application\/json/);
    assert.equal((await health.json()).status, "ok");

    const tools = await fetch(`${base}/api/index?__jf_route=v2%2Ftools&limit=1`);
    assert.equal(tools.status, 200);
    const body = await tools.json();
    assert.equal(body.status, "success");
    assert.equal(body.data.length, 1);

    const missing = await fetch(`${base}/api/index?__jf_route=unknown`);
    assert.equal(missing.status, 404);
    assert.match(missing.headers.get("content-type") ?? "", /application\/json/);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => {
      if (error) reject(error);
      else resolve();
    }));
  }
});

test("the compiled API runs in native Node ESM without tsx", () => {
  const outDir = mkdtempSync(join(process.cwd(), ".native-api-test-"));
  const env = { ...process.env, NODE_ENV: "production", NODE_OPTIONS: "" };
  try {
    const tsc = join(process.cwd(), "node_modules", "typescript", "bin", "tsc");
    execFileSync(process.execPath, [
      tsc, "--target", "ES2022", "--module", "NodeNext", "--skipLibCheck",
      "--outDir", outDir, "api/index.ts",
    ], { env, stdio: "pipe", timeout: 30_000 });

    const apiEntry = pathToFileURL(join(outDir, "api", "index.js")).href;
    const smoke = `
      import assert from "node:assert/strict";
      import { once } from "node:events";
      import { createServer } from "node:http";
      const { default: handler } = await import(process.argv[1]);
      const server = createServer(handler);
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      try {
        const base = "http://127.0.0.1:" + server.address().port;
        const health = await fetch(base + "/api/health");
        assert.equal(health.status, 200);
        assert.equal((await health.json()).status, "ok");
        const catalog = await fetch(base + "/api/index?__jf_route=v2%2Ftools&limit=1");
        assert.equal(catalog.status, 200);
        assert.equal((await catalog.json()).data.length, 1);
      } finally {
        server.closeAllConnections();
        server.close();
      }
    `;
    execFileSync(process.execPath, ["--input-type=module", "--eval", smoke, apiEntry], {
      env, stdio: "pipe", timeout: 15_000,
    });
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});
