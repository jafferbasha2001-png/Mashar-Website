export async function getCustomers(page = 1, limit = 10) {
  const response = await fetch(`/api/customers?page=${page}&limit=${limit}`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Unable to load customers.');
  return payload;
}