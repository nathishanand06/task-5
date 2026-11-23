const state = {
  view: "browse",
  userName: localStorage.getItem("portal_user_name") || "Aarav Sharma",
  userEmail: localStorage.getItem("portal_user_email") || "aarav@example.com",
  internships: [],
  savedIds: [],
  applications: []
};

const viewContainer = document.getElementById("view-container");
const statusRegion = document.getElementById("status-region");
const searchInput = document.getElementById("search-input");
const domainSelect = document.getElementById("domain-select");
const applyModal = document.getElementById("apply-modal");
const userModal = document.getElementById("user-modal");

function showAlert(message, type = "success") {
  statusRegion.innerHTML = `<div class="alert alert-${type}" role="status">${escapeHtml(message)}</div>`;
  setTimeout(() => {
    statusRegion.innerHTML = "";
  }, 4500);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) {
    const detail = Array.isArray(data.details) ? ` (${data.details.join(" ")})` : "";
    throw new Error((data.error || "Request failed") + detail);
  }
  return data;
}

async function checkHealth() {
  const el = document.getElementById("health-indicator");
  try {
    const data = await fetchJson("/health");
    el.textContent = `System status: ${data.status.toUpperCase()} (uptime ${data.uptimeSeconds}s)`;
  } catch {
    el.textContent = "System status: OFFLINE";
  }
}

async function loadAllData() {
  viewContainer.setAttribute("aria-busy", "true");
  viewContainer.innerHTML = `<div class="banner">Loading internships...</div>`;

  try {
    const params = new URLSearchParams({
      q: searchInput.value.trim(),
      domain: domainSelect.value
    });

    const [rolesData, savedData, appsData] = await Promise.all([
      fetchJson(`/api/internships?${params.toString()}`),
      fetchJson(`/api/saved?email=${encodeURIComponent(state.userEmail)}`),
      fetchJson(`/api/applications?email=${encodeURIComponent(state.userEmail)}`)
    ]);

    state.internships = rolesData.internships;
    state.savedIds = savedData.savedIds;
    state.applications = appsData.applications;

    updateHeaderCounts();
    renderCurrentView();
  } catch (err) {
    viewContainer.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
  } finally {
    viewContainer.setAttribute("aria-busy", "false");
  }
}

function updateHeaderCounts() {
  document.getElementById("active-user-label").textContent = `Signed in: ${state.userEmail}`;
  document.getElementById("saved-count").textContent = state.savedIds.length;
  document.getElementById("apps-count").textContent = state.applications.length;
}

function renderInternshipCard(role) {
  const isSaved = state.savedIds.includes(role.id);
  const existingApp = state.applications.find(
    (a) => a.internshipId === role.id && a.status !== "Withdrawn"
  );

  return `
    <article class="card">
      <div>
        <div class="card-header">
          <div>
            <h2>${escapeHtml(role.title)}</h2>
            <div class="company">${escapeHtml(role.company)}</div>
          </div>
          <span class="badge">${escapeHtml(role.domain)}</span>
        </div>

        <ul class="meta-list">
          <li><strong>Location:</strong> ${escapeHtml(role.location)}</li>
          <li><strong>Stipend:</strong> ${escapeHtml(role.stipend)}</li>
          <li><strong>Duration:</strong> ${escapeHtml(role.duration)}</li>
          <li><strong>Deadline:</strong> ${escapeHtml(role.deadline)}</li>
        </ul>

        <p style="margin:0.5rem 0 0.75rem;font-size:0.93rem;">${escapeHtml(role.description)}</p>

        <div class="skills">
          ${role.skills.map((s) => `<span class="skill-chip">${escapeHtml(s)}</span>`).join("")}
        </div>
      </div>

      <div class="card-actions">
        <button
          type="button"
          class="btn btn-primary"
          data-action="open-apply"
          data-id="${escapeHtml(role.id)}"
        >
          ${existingApp ? `Applied (${escapeHtml(existingApp.status)})` : "View & Apply"}
        </button>
        <button
          type="button"
          class="btn btn-secondary"
          aria-pressed="${isSaved}"
          data-action="toggle-save"
          data-id="${escapeHtml(role.id)}"
        >
          ${isSaved ? "Saved" : "Save Role"}
        </button>
      </div>
    </article>
  `;
}

function renderCurrentView() {
  const browseControls = document.getElementById("browse-controls");
  browseControls.style.display = state.view === "browse" ? "block" : "none";

  if (state.view === "browse") {
    if (state.internships.length === 0) {
      viewContainer.innerHTML = `
        <div class="empty-state">
          <h2>No matching internships found</h2>
          <p>Try clearing your search filter or choosing "All Domains".</p>
        </div>
      `;
      return;
    }
    viewContainer.innerHTML = `<div class="grid">${state.internships.map(renderInternshipCard).join("")}</div>`;
    return;
  }

  if (state.view === "saved") {
    const savedRoles = state.internships.filter((r) => state.savedIds.includes(r.id));
    if (savedRoles.length === 0) {
      viewContainer.innerHTML = `
        <div class="empty-state">
          <h2>No saved internships yet</h2>
          <p>Bookmark roles from "Explore Roles" to compare and apply later.</p>
        </div>
      `;
      return;
    }
    viewContainer.innerHTML = `<div class="grid">${savedRoles.map(renderInternshipCard).join("")}</div>`;
    return;
  }

  if (state.view === "applications") {
    if (state.applications.length === 0) {
      viewContainer.innerHTML = `
        <div class="empty-state">
          <h2>No applications submitted yet</h2>
          <p>Browse open roles and submit your first application.</p>
        </div>
      `;
      return;
    }

    viewContainer.innerHTML = `
      <div class="grid">
        ${state.applications
          .map((app) => {
            const statusSlug = app.status.toLowerCase().replace(/\s+/g, "-");
            return `
              <article class="card">
                <div>
                  <div class="card-header">
                    <div>
                      <h2>${escapeHtml(app.internshipTitle)}</h2>
                      <div class="company">${escapeHtml(app.company)}</div>
                    </div>
                    <span class="badge status-${escapeHtml(statusSlug)}">${escapeHtml(app.status)}</span>
                  </div>
                  <p style="font-size:0.9rem;color:#475569;margin:0.6rem 0;">
                    Applied on ${new Date(app.appliedAt).toLocaleDateString("en-IN")}
                  </p>
                  <p style="font-size:0.9rem;margin:0.4rem 0;">
                    <strong>Resume:</strong> <a href="${escapeHtml(app.resumeUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(app.resumeUrl)}</a>
                  </p>
                  ${app.note ? `<p style="font-size:0.9rem;color:#334155;"><strong>Note:</strong> ${escapeHtml(app.note)}</p>` : ""}
                </div>
                ${
                  app.status !== "Withdrawn"
                    ? `<div class="card-actions">
                        <button type="button" class="btn btn-danger" data-action="withdraw" data-id="${escapeHtml(app.id)}">
                          Withdraw Application
                        </button>
                      </div>`
                    : ""
                }
              </article>
            `;
          })
          .join("")}
      </div>
    `;
  }
}

function openApplyModal(internshipId) {
  const role = state.internships.find((r) => r.id === internshipId);
  if (!role) return;

  document.getElementById("modal-title").textContent = role.title;
  document.getElementById("modal-company").textContent = `${role.company} • ${role.location} • ${role.stipend}`;
  document.getElementById("modal-description").textContent = role.description;
  document.getElementById("modal-responsibilities").innerHTML = role.responsibilities
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  document.getElementById("apply-internship-id").value = role.id;
  document.getElementById("applicant-name").value = state.userName;
  document.getElementById("applicant-email").value = state.userEmail;
  document.getElementById("resume-url").value = "https://github.com/aarav-dev";
  document.getElementById("applicant-note").value = "";

  applyModal.showModal();
}

// Event listeners
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.setAttribute("aria-selected", "false"));
    btn.setAttribute("aria-selected", "true");
    state.view = btn.dataset.view;
    renderCurrentView();
  });
});

let searchTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadAllData, 200);
});

domainSelect.addEventListener("change", loadAllData);

viewContainer.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;

  if (action === "open-apply") {
    openApplyModal(id);
  } else if (action === "toggle-save") {
    try {
      const data = await fetchJson("/api/saved/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state.userEmail, internshipId: id })
      });
      state.savedIds = data.savedIds;
      updateHeaderCounts();
      renderCurrentView();
      showAlert(data.saved ? "Saved role to your bookmarks." : "Removed role from bookmarks.");
    } catch (err) {
      showAlert(err.message, "error");
    }
  } else if (action === "withdraw") {
    try {
      await fetchJson(`/api/applications/${encodeURIComponent(id)}/withdraw`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state.userEmail })
      });
      showAlert("Application withdrawn.");
      await loadAllData();
    } catch (err) {
      showAlert(err.message, "error");
    }
  }
});

document.getElementById("apply-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    internshipId: document.getElementById("apply-internship-id").value,
    applicantName: document.getElementById("applicant-name").value,
    applicantEmail: document.getElementById("applicant-email").value,
    resumeUrl: document.getElementById("resume-url").value,
    note: document.getElementById("applicant-note").value
  };

  try {
    await fetchJson("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    applyModal.close();
    showAlert("Application submitted successfully!");
    await loadAllData();
  } catch (err) {
    showAlert(err.message, "error");
  }
});

document.getElementById("close-modal-btn").addEventListener("click", () => applyModal.close());
document.getElementById("cancel-modal-btn").addEventListener("click", () => applyModal.close());

document.getElementById("switch-user-btn").addEventListener("click", () => {
  document.getElementById("profile-name").value = state.userName;
  document.getElementById("profile-email").value = state.userEmail;
  userModal.showModal();
});

document.getElementById("close-user-modal").addEventListener("click", () => userModal.close());

document.getElementById("user-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  state.userName = document.getElementById("profile-name").value.trim();
  state.userEmail = document.getElementById("profile-email").value.trim().toLowerCase();
  localStorage.setItem("portal_user_name", state.userName);
  localStorage.setItem("portal_user_email", state.userEmail);
  userModal.close();
  showAlert(`Switched profile to ${state.userEmail}`);
  await loadAllData();
});

checkHealth();
loadAllData();
