/**
 * api.js — Centralised API base URL helper
 *
 * In development, VITE_API_BASE_URL is empty and Vite's proxy rewrites
 * every "/api/..." request to "http://localhost:5000/api/...".
 *
 * In production, set VITE_API_BASE_URL to your deployed backend origin
 * (e.g. "https://school-api.onrender.com") in the client's environment
 * variables. All fetch calls below will automatically prepend it.
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Wrapper around fetch that:
 *  - Prepends the API base URL
 *  - Automatically sets Content-Type: application/json for JSON bodies
 *  - Returns the parsed JSON response
 *  - Throws an Error with the server's message on non-2xx responses
 *
 * @param {string} path      - API path starting with "/api/..."
 * @param {object} [options] - Standard fetch options (method, headers, body …)
 * @param {string} [token]   - Optional JWT token — added as Bearer header
 */
export async function apiFetch(path, options = {}, token = null) {
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type for non-FormData bodies
  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  // Handle empty responses (e.g. 204 No Content)
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message = data.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export default API_BASE;
