require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const apiRouter = require("./routes/api");
const { internships } = require("./data/store");
const { log, requestLogger } = require("./middleware/logger");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const startedAt = Date.now();

// Security headers (CSP configured to allow inline styles/scripts for single-bundle demo)
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "*"
  })
);

app.use(express.json({ limit: "50kb" }));
app.use(requestLogger);

// Health & readiness endpoint
app.get("/health", (_req, res) => {
  const storeHealthy = Array.isArray(internships) && internships.length > 0;
  const statusCode = storeHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: storeHealthy ? "ok" : "degraded",
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
    checks: {
      datastore: storeHealthy ? "reachable" : "unavailable",
      memoryRssMb: Math.round(process.memoryUsage().rss / 1024 / 1024)
    }
  });
});

app.use("/api", apiRouter);
app.use(express.static(path.join(__dirname, "..", "public")));

// Fallback to SPA index for client routes
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Centralized safe error handler
app.use((err, req, res, _next) => {
  log("error", "unhandled_error", {
    requestId: req.requestId,
    error: err.message
  });
  res.status(500).json({
    error: "Internal server error",
    requestId: req.requestId
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    log("info", "server_started", {
      port: PORT,
      env: process.env.NODE_ENV || "development"
    });
  });
}

module.exports = app;
