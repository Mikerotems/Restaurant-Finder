const express = require("express");

const app = express();
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);
const requestWindows = new Map();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use((req, res, next) => {
  const origin = req.get("Origin");
  if (!origin) return next();
  if (!allowedOrigins.has(origin)) {
    return res.status(403).json({ error: "Origin is not allowed." });
  }

  res.set("Access-Control-Allow-Origin", origin);
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Edamam-Account-User");
  res.set("Vary", "Origin");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/restaurants", async (req, res) => {
  const forwarded = new URLSearchParams();
  for (const key of ["term", "location", "latitude", "longitude"]) {
    const value = req.query[key];
    if (typeof value === "string" && value.trim()) {
      forwarded.set(key, value.trim());
    }
  }

  const hasLocation = forwarded.has("location");
  const hasLatitude = forwarded.has("latitude");
  const hasLongitude = forwarded.has("longitude");
  if (
    !forwarded.has("term") ||
    forwarded.get("term").length > 100 ||
    (!hasLocation && !(hasLatitude && hasLongitude)) ||
    (hasLocation && (hasLatitude || hasLongitude)) ||
    (hasLocation && forwarded.get("location").length > 100)
  ) {
    return res.status(400).json({
      error:
        "A search term (up to 100 characters) and either location or a coordinate pair are required.",
    });
  }
  if (forwarded.has("latitude") || forwarded.has("longitude")) {
    const latitude = Number(forwarded.get("latitude"));
    const longitude = Number(forwarded.get("longitude"));
    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({ error: "Search coordinates are invalid." });
    }
  }

  const radius = Number(req.query.radius);
  if (!Number.isFinite(radius) || radius <= 0) {
    return res.status(400).json({ error: "Search radius is invalid." });
  }

  forwarded.set("radius", String(Math.min(Math.round(radius), 40000)));
  forwarded.set("open_now", "true");
  forwarded.set("sort_by", "best_match");
  forwarded.set("limit", "20");

  try {
    const response = await fetch(
      `https://krrmol812i.execute-api.us-west-2.amazonaws.com/yelpapi?${forwarded}`,
      { signal: AbortSignal.timeout(15_000) }
    );
    const payload = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: payload.error?.description ?? payload.message ?? "Restaurant search failed.",
      });
    }
    res.json(payload);
  } catch (error) {
    console.error("Restaurant proxy request failed:", error);
    res.status(502).json({ error: "Restaurant search is temporarily unavailable." });
  }
});

app.get("/api/recipes", async (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const userId = req.get("Edamam-Account-User") ?? "";
  if (!query || query.length > 100) {
    return res
      .status(400)
      .json({ error: "Search term must be 1 to 100 characters." });
  }
  if (!/^[a-f0-9]{30}$/i.test(userId)) {
    return res.status(400).json({ error: "A valid anonymous user ID is required." });
  }

  const now = Date.now();
  let window = requestWindows.get(req.ip);
  if (!window || window.expiresAt <= now) {
    if (requestWindows.size >= 5000) {
      for (const [ip, entry] of requestWindows) {
        if (entry.expiresAt <= now) requestWindows.delete(ip);
      }
    }
    if (requestWindows.size >= 5000 && !window) {
      return res.status(429).json({ error: "Too many requests. Try again shortly." });
    }
    window = { count: 0, expiresAt: now + RATE_WINDOW_MS };
    requestWindows.set(req.ip, window);
  }
  if (window.count >= RATE_LIMIT) {
    return res
      .status(429)
      .json({ error: "Too many requests. Try again shortly." });
  }
  window.count += 1;

  const appId = process.env.EDAMAM_APP_ID;
  const appKey = process.env.EDAMAM_APP_KEY;
  if (!appId || !appKey) {
    console.error("Edamam app credentials are not configured.");
    return res
      .status(503)
      .json({ error: "Recipe search is temporarily unavailable." });
  }

  const params = new URLSearchParams({
    type: "public",
    q: query,
    app_id: appId,
    app_key: appKey,
    to: "12",
  });

  try {
    const response = await fetch(
      `https://api.edamam.com/api/recipes/v2?${params}`,
      {
        headers: { "Edamam-Account-User": userId },
        signal: AbortSignal.timeout(15_000),
      }
    );
    const payload = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: payload.message ?? "Edamam recipe search failed.",
      });
    }
    res.json(payload);
  } catch (error) {
    console.error("Edamam recipe proxy request failed:", error);
    res.status(502).json({ error: "Recipe search is temporarily unavailable." });
  }
});

const port = Number(process.env.PORT) || 3000;
if (require.main === module) {
  app.listen(port, () =>
    console.log(`Recipe API proxy listening on port ${port}`)
  );
}

module.exports = app;
