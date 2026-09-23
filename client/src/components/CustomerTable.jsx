import { useEffect, useState } from 'react';
import { getCustomers } from '../services/customerService';

export default function CustomerTable() {
  const params = new URLSearchParams(window.location.search);
  const initialPage = Number(params.get('page') || 1);
  const [query, setQuery] = useState({ page: Number.isSafeInteger(initialPage) && initialPage > 0 ? initialPage : 1, search: params.get('search') || '' });
  const [input, setInput] = useState(query.search);
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState({ loading: true, error: '', rows: [], pagination: null });
  useEffect(() => {
    const controller = new AbortController();
    setState(current => ({ ...current, loading: true, error: '' }));
    getCustomers(query.page, 10, query.search, controller.signal).then(data => {
      setState({ loading: false, error: '', rows: data.data, pagination: data.pagination });
    }).catch(error => {
      if (!controller.signal.aborted) setState({ loading: false, error: error.message, rows: [], pagination: null });
    });
    return () => controller.abort();
  }, [query, retry]);
  function updateQuery(next) {
    setQuery(next);
    const parameters = new URLSearchParams({ page: next.page, search: next.search });
    window.history.replaceState(null, '', `/customers?${parameters}`);
  }
  const returnQuery = new URLSearchParams({ page: query.page, search: query.search }).toString();
  return <section className="customers section customer-page" id="customers"><div className="container">
    <div className="section-head"><div><p className="eyebrow">CUSTOMER DIRECTORY</p><h1>Customers</h1></div><p className="head-copy">Browse your customers and select a name to view their details.</p></div>
    <form className="customer-search" role="search" onSubmit={event => { event.preventDefault(); updateQuery({ page: 1, search: input.trim() }); }}>
      <div><label htmlFor="customer-search">Search customers</label><input id="customer-search" type="search" maxLength={200} value={input} onChange={event => setInput(event.target.value)} placeholder="Name, ID, email, phone, city or country" /></div>
      <button className="btn btn-gold" type="submit">Search</button>
      {(input || query.search) && <button className="customer-clear" type="button" onClick={() => { setInput(''); updateQuery({ page: 1, search: '' }); }}>Clear</button>}
    </form>
    {state.loading ? <p className="customer-status" role="status">Loading customers...</p> : state.error ? <div className="customer-status customer-error" role="alert">{state.error} <button type="button" onClick={() => setRetry(value => value + 1)}>Try again</button></div> : <>
      <p className="customer-count" role="status">{state.pagination.total} customer{state.pagination.total === 1 ? '' : 's'}{query.search && <> matching &ldquo;{query.search}&rdquo;</>}</p>
      {state.rows.length === 0 ? <p className="customer-status">No customers found. Try another search or clear the filter.</p> : <div className="customer-table-wrap"><table className="customer-table"><caption className="sr-only">Customer directory. Select a customer name to view details.</caption><thead><tr>{['ID', 'Name', 'Email', 'Phone', 'City', 'Country'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{state.rows.map(customer => <tr key={customer.customer_id}><td>{customer.customer_id}</td><td><a className="customer-name" href={`/customers/${customer.customer_id}?${returnQuery}`}>{customer.first_name} {customer.last_name}</a></td><td>{customer.email}</td><td>{customer.phone || '—'}</td><td>{customer.city || '—'}</td><td>{customer.country || '—'}</td></tr>)}</tbody></table></div>}
      {(state.pagination.totalPages > 1 || query.page > 1) && <nav className="customer-pagination" aria-label="Customer pages"><button type="button" disabled={query.page <= 1} onClick={() => updateQuery({ ...query, page: query.page - 1 })}>Previous</button><span>Page {query.page} of {Math.max(1, state.pagination.totalPages)}</span><button type="button" disabled={query.page >= state.pagination.totalPages} onClick={() => updateQuery({ ...query, page: query.page + 1 })}>Next</button></nav>}
    </>}
  </div></section>;
}
