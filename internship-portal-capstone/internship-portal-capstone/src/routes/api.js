const express = require("express");
const crypto = require("crypto");
const { internships, applications, savedIdsByUser } = require("../data/store");
const { validateApplication, sanitizeString, isValidEmail } = require("../middleware/validate");
const { log } = require("../middleware/logger");

const router = express.Router();

// GET /api/internships?q=&domain=
router.get("/internships", (req, res) => {
  const q = sanitizeString(req.query.q || "", 100).toLowerCase();
  const domain = sanitizeString(req.query.domain || "", 50);

  let results = internships;

  if (domain && domain !== "All") {
    results = results.filter((item) => item.domain.toLowerCase() === domain.toLowerCase());
  }

  if (q) {
    results = results.filter((item) => {
      const haystack = [
        item.title,
        item.company,
        item.location,
        item.domain,
        ...item.skills
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  res.json({ count: results.length, internships: results });
});

// GET /api/internships/:id
router.get("/internships/:id", (req, res) => {
  const id = sanitizeString(req.params.id, 50);
  const internship = internships.find((item) => item.id === id);
  if (!internship) {
    return res.status(404).json({ error: "Internship not found" });
  }
  res.json({ internship });
});

// GET /api/applications?email=
router.get("/applications", (req, res) => {
  const email = sanitizeString(req.query.email || "", 120).toLowerCase();
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: "Valid email query parameter is required" });
  }

  const userApps = applications
    .filter((app) => app.applicantEmail === email)
    .map((app) => {
      const internship = internships.find((i) => i.id === app.internshipId);
      return {
        ...app,
        internshipTitle: internship ? internship.title : "Unknown Role",
        company: internship ? internship.company : "Unknown Company"
      };
    });

  res.json({ count: userApps.length, applications: userApps });
});

// POST /api/applications
router.post("/applications", validateApplication, (req, res) => {
  const payload = req.sanitizedApplication;
  const internship = internships.find((i) => i.id === payload.internshipId);
  if (!internship) {
    return res.status(404).json({ error: "Target internship does not exist" });
  }

  const duplicate = applications.find(
    (app) =>
      app.internshipId === payload.internshipId &&
      app.applicantEmail === payload.applicantEmail
  );
  if (duplicate) {
    return res.status(409).json({ error: "You have already applied to this internship" });
  }

  const created = {
    id: `app-${crypto.randomBytes(3).toString("hex")}`,
    ...payload,
    status: "Submitted",
    appliedAt: new Date().toISOString()
  };

  applications.push(created);
  log("info", "application_created", {
    requestId: req.requestId,
    applicationId: created.id,
    internshipId: created.internshipId
  });

  res.status(201).json({
    message: "Application submitted successfully",
    application: {
      ...created,
      internshipTitle: internship.title,
      company: internship.company
    }
  });
});

// PATCH /api/applications/:id/withdraw
router.patch("/applications/:id/withdraw", (req, res) => {
  const id = sanitizeString(req.params.id, 50);
  const email = sanitizeString(req.body.email || "", 120).toLowerCase();

  const app = applications.find((a) => a.id === id);
  if (!app) {
    return res.status(404).json({ error: "Application not found" });
  }
  if (app.applicantEmail !== email) {
    return res.status(403).json({ error: "Not authorized to modify this application" });
  }

  app.status = "Withdrawn";
  log("info", "application_withdrawn", {
    requestId: req.requestId,
    applicationId: app.id
  });

  res.json({ message: "Application withdrawn", application: app });
});

// GET /api/saved?email=
router.get("/saved", (req, res) => {
  const email = sanitizeString(req.query.email || "", 120).toLowerCase();
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: "Valid email query parameter is required" });
  }
  res.json({ savedIds: savedIdsByUser[email] || [] });
});

// POST /api/saved/toggle
router.post("/saved/toggle", (req, res) => {
  const email = sanitizeString(req.body.email || "", 120).toLowerCase();
  const internshipId = sanitizeString(req.body.internshipId || "", 50);

  if (!isValidEmail(email) || !internshipId) {
    return res.status(400).json({ error: "Valid email and internshipId are required" });
  }

  if (!savedIdsByUser[email]) {
    savedIdsByUser[email] = [];
  }

  const idx = savedIdsByUser[email].indexOf(internshipId);
  let saved = false;
  if (idx === -1) {
    savedIdsByUser[email].push(internshipId);
    saved = true;
  } else {
    savedIdsByUser[email].splice(idx, 1);
  }

  res.json({ saved, savedIds: savedIdsByUser[email] });
});

module.exports = router;
