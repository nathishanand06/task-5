function sanitizeString(value, maxLen = 500) {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").trim().slice(0, maxLen);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidHttpUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function validateApplication(req, res, next) {
  const internshipId = sanitizeString(req.body.internshipId, 50);
  const applicantName = sanitizeString(req.body.applicantName, 100);
  const applicantEmail = sanitizeString(req.body.applicantEmail, 120).toLowerCase();
  const resumeUrl = sanitizeString(req.body.resumeUrl, 300);
  const note = sanitizeString(req.body.note, 1000);

  const errors = [];
  if (!internshipId) errors.push("internshipId is required.");
  if (applicantName.length < 2) errors.push("applicantName must be at least 2 characters.");
  if (!isValidEmail(applicantEmail)) errors.push("A valid applicantEmail is required.");
  if (!isValidHttpUrl(resumeUrl)) errors.push("A valid http/https resumeUrl is required.");

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  req.sanitizedApplication = {
    internshipId,
    applicantName,
    applicantEmail,
    resumeUrl,
    note
  };
  next();
}

module.exports = {
  sanitizeString,
  isValidEmail,
  validateApplication
};
