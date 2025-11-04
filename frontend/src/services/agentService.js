// frontend/src/services/agentService.js
const API_BASE = "/api/agents.php";

// Helper: JSON POST
async function postJSON(action, data) {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...data }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Request failed");
  return result;
}

// Register new agent
export async function registerAgent(data) {
  return await postJSON("register", data);
}

// Complete profile
export async function completeProfile(agent_id, data) {
  return await postJSON("complete_profile", { agent_id, ...data });
}

// Upload document (with FormData)
export async function uploadAgentDocument(agent_id, doc_type, file) {
  const formData = new FormData();
  formData.append("action", "upload_document");
  formData.append("agent_id", agent_id);
  formData.append("doc_type", doc_type);
  formData.append("file", file);

  const response = await fetch(API_BASE, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "File upload failed");
  return result;
}

// Fetch pending verifications
export async function getPendingAgents() {
  const response = await fetch(`${API_BASE}?pending=true`);
  return await response.json();
}

// Verify or reject agent
export async function verifyAgent(agent_id, status) {
  const response = await fetch(API_BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent_id, status }),
  });
  return await response.json();
}
