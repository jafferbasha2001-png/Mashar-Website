import { useEffect, useState } from 'react';
import { getCustomers } from '../services/customerService';

export default function CustomerTable() {
  const [state, setState] = useState({ loading: true, error: '', rows: [], pagination: null });
  const [page, setPage] = useState(1);
  const limit = 8;
  useEffect(() => { let active = true; setState(current => ({ ...current, loading: true, error: '' })); getCustomers(page, limit).then(data => { if (active) setState({ loading: false, error: '', rows: data.data, pagination: data.pagination }); }).catch(error => { if (active) setState({ loading: false, error: error.message, rows: [], pagination: null }); }); return () => { active = false; }; }, [page]);
  return <section className="customers section" id="customers"><div className="container"><div className="section-head"><div><p className="eyebrow">CUSTOMER DIRECTORY</p><h2>Customers connected to Mashar.</h2></div><p className="head-copy">A live view of customers from the local MySQL database.</p></div>
    {state.loading && <p className="customer-status" role="status">Loading customers...</p>}{!state.loading && state.error && <div className="customer-status customer-error" role="alert">{state.error}</div>}{!state.loading && !state.error && state.rows.length === 0 && <p className="customer-status">No customers found.</p>}
    {!state.loading && !state.error && state.rows.length > 0 && <><div className="customer-table-wrap"><table className="customer-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>City</th><th>Country</th><th>Created</th></tr></thead><tbody>{state.rows.map(customer => <tr key={customer.customer_id}><td>{customer.first_name} {customer.last_name}</td><td>{customer.email}</td><td>{customer.phone || '—'}</td><td>{customer.city || '—'}</td><td>{customer.country || '—'}</td><td>{new Date(customer.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div><div className="customer-pagination"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {state.pagination.page} of {state.pagination.totalPages}</span><button type="button" disabled={page >= state.pagination.totalPages} onClick={() => setPage(page + 1)}>Next</button></div></>}
  </div></section>;
}