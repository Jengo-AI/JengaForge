import assert from "node:assert/strict";
import { createServer } from "node:http";
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
