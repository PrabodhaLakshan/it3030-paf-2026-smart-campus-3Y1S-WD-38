const BASE_URL = "http://localhost:8080/api/tickets";

function normalizeAttachmentUrls(ticket) {
  const candidates = [
    ticket?.attachmentUrls,
    ticket?.imageUrls,
    ticket?.images,
    ticket?.attachments,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function normalizeTicket(ticket) {
  if (!ticket || typeof ticket !== "object") {
    return ticket;
  }

  return {
    ...ticket,
    assetFacility:
      ticket.assetFacility ?? ticket.asset_facility ?? ticket.assetFacilityName ?? ticket.asset ?? "",
    location: ticket.location ?? ticket.ticketLocation ?? ticket.site ?? "",
    category: ticket.category ?? ticket.ticketCategory ?? ticket.issueCategory ?? "",
    attachmentUrls: normalizeAttachmentUrls(ticket),
  };
}

function normalizeTicketList(payload) {
  if (!Array.isArray(payload)) {
    return normalizeTicket(payload);
  }

  return payload.map((ticket) => normalizeTicket(ticket));
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    cache: "no-store",
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload || "Ticket request failed."
        : payload?.message || payload?.error || "Ticket request failed.";
    throw new Error(message);
  }

  return normalizeTicketList(payload);
}

function buildOptions(method, body) {
  const headers = {};

  if (!(body instanceof FormData) && body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  return {
    method,
    headers,
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  };
}

export function getAllTickets() {
  return request(BASE_URL);
}

export function getTechnicians() {
  return request("http://localhost:8080/api/technicians");
}

export function getTicketById(id) {
  return request(`${BASE_URL}/${id}`);
}

export function createTicket(data) {
  return request(BASE_URL, buildOptions("POST", data));
}

export function updateTicket(id, data) {
  const params = new URLSearchParams();

  if (data?.userId) params.set("userId", data.userId);

  return request(`${BASE_URL}/${id}?${params.toString()}`, buildOptions("PUT", data));
}

export function deleteTicket(id, userId) {
  const params = new URLSearchParams();

  if (userId) params.set("userId", userId);

  return request(`${BASE_URL}/${id}?${params.toString()}`, buildOptions("DELETE"));
}

export function createTicketWithFiles(ticket, files = []) {
  const formData = new FormData();
  formData.append("ticket", new Blob([JSON.stringify(ticket)], { type: "application/json" }));

  files.forEach((file) => {
    formData.append("files", file);
  });

  return request(BASE_URL, buildOptions("POST", formData));
}

export function updateTicketStatus(id, { status, notes, techId, userId }) {
  const params = new URLSearchParams();

  if (status) params.set("status", status);
  if (notes) params.set("notes", notes);
  if (techId) params.set("techId", techId);
  if (userId) params.set("userId", userId);

  return request(`${BASE_URL}/${id}/status?${params.toString()}`, buildOptions("PATCH"));
}

export function addComment(ticketId, comment) {
  return request(`${BASE_URL}/${ticketId}/comments`, buildOptions("POST", comment));
}

export function updateComment(ticketId, commentId, comment, userId, userRole) {
  const params = new URLSearchParams();

  if (userId) params.set("userId", userId);
  if (userRole) params.set("userRole", userRole);

  return request(
    `${BASE_URL}/${ticketId}/comments/${commentId}?${params.toString()}`,
    buildOptions("PUT", comment)
  );
}

export function deleteComment(ticketId, commentId, userId, userRole) {
  const params = new URLSearchParams();

  if (userId) params.set("userId", userId);
  if (userRole) params.set("userRole", userRole);

  return request(
    `${BASE_URL}/${ticketId}/comments/${commentId}?${params.toString()}`,
    buildOptions("DELETE")
  );
}

export function assignTechnician(id, techId) {
  const params = new URLSearchParams();

  if (techId) params.set("techId", techId);

  return request(`${BASE_URL}/${id}/assignee?${params.toString()}`, buildOptions("PATCH"));
}