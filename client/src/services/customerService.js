async function requestCustomerApi(path, signal) {
  const response = await fetch(path, { signal });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Unable to load customers. Please try again.');
  return payload;
}

export function getCustomers(page = 1, limit = 10, search = '', signal) {
  const query = new URLSearchParams({ page, limit, search });
  return requestCustomerApi(`/api/customers?${query}`, signal);
}

export function getCustomer(id, signal) {
  return requestCustomerApi(`/api/customers/${encodeURIComponent(id)}`, signal);
}
