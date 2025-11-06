const API_BASE = "http://localhost:8000/api/agent.php";

// GET list (optional filter)
export async function fetchAgents(filter = null) {
  const url = new URL(API_BASE);
  url.searchParams.set('list', 'all');
  if (filter) url.searchParams.set('filter', filter);
  const res = await fetch(url.toString());
  return res.json();
}

// GET single agent by id
export async function fetchAgentById(id) {
  const url = new URL(API_BASE);
  url.searchParams.set('id', id);
  const res = await fetch(url.toString());
  return res.json();
}

// Review agent (approve/reject)
export async function reviewAgentAdmin({ agent_id, reviewer_id, decision, comment }) {
  const res = await fetch(API_BASE, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'review',
      agent_id,
      reviewer_id,
      decision,
      comment
    })
  });
  return res.json();
}
