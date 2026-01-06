// frontend/src/services/salaryStructureService.js
const API_BASE = "/api/salary-structures";

export const getAllStructures = async () => {
try {
const res = await fetch(API_BASE);
if (!res.ok) throw new Error(`HTTP ${res.status}`);
return await res.json();
} catch (error) {
console.error("Error fetching salary structures:", error);
return [];
}
};

export const createStructure = async (data) => {
try {
const res = await fetch(API_BASE, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(data),
});
if (!res.ok) throw new Error(`HTTP ${res.status}`);
return await res.json();
} catch (error) {
console.error("Error creating salary structure:", error);
return null;
}
};

export const updateStructure = async (id, data) => {
try {
const res = await fetch(`${API_BASE}/${id}`, {
method: "PUT",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(data),
});
if (!res.ok) throw new Error(`HTTP ${res.status}`);
return await res.json();
} catch (error) {
console.error("Error updating salary structure:", error);
return null;
}
};

export const deleteStructure = async (id) => {
try {
const res = await fetch(`${API_BASE}/${id}`, {
method: "DELETE",
});
if (!res.ok) throw new Error(`HTTP ${res.status}`);
return await res.json();
} catch (error) {
console.error("Error deleting salary structure:", error);
return null;
}
};
