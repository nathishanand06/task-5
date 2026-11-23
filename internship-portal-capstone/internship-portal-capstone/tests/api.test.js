const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../src/server");

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(() => {
  server.close();
});

test("GET /health returns 200 and datastore check", async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, "ok");
  assert.equal(body.checks.datastore, "reachable");
});

test("GET /api/internships filters by domain and query", async () => {
  const res = await fetch(`${baseUrl}/api/internships?domain=Backend&q=Node`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.count, 1);
  assert.equal(body.internships[0].id, "int-102");
});

test("POST /api/applications rejects invalid input and prevents duplicates", async () => {
  // Invalid payload
  const badRes = await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      internshipId: "int-102",
      applicantName: "A",
      applicantEmail: "not-an-email",
      resumeUrl: "ftp://invalid"
    })
  });
  assert.equal(badRes.status, 400);

  // Valid payload
  const validPayload = {
    internshipId: "int-102",
    applicantName: "Priya Nair",
    applicantEmail: "priya@example.com",
    resumeUrl: "https://example.com/priya.pdf",
    note: "Experienced with Node.js APIs"
  };

  const createRes = await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validPayload)
  });
  assert.equal(createRes.status, 201);

  // Duplicate submission check (regression test)
  const dupRes = await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validPayload)
  });
  assert.equal(dupRes.status, 409);
});
