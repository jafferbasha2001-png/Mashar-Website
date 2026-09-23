import { useEffect, useState } from 'react';
import { getCustomer } from '../services/customerService';

export default function CustomerDetails({ id }) {
  const [state, setState] = useState({ loading: true, error: '', customer: null });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true, error: '', customer: null });
    getCustomer(id, controller.signal).then(({ data }) => setState({ loading: false, error: '', customer: data })).catch(error => {
      if (!controller.signal.aborted) setState({ loading: false, error: error.message, customer: null });
    });
    return () => controller.abort();
  }, [id, retry]);
  const customer = state.customer;
  return <section className="section customer-page"><div className="container">
    <a className="customer-back" href={`/customers${window.location.search}`}>← Back to customers</a>
    <p className="eyebrow">CUSTOMER DIRECTORY</p><h1>Customer details</h1>
    {state.loading ? <p className="customer-status" role="status">Loading customer details...</p> : state.error ? <div className="customer-status customer-error" role="alert">{state.error} <button type="button" onClick={() => setRetry(value => value + 1)}>Try again</button></div> : <article className="customer-detail-card">
      <h2>{customer.first_name} {customer.last_name}</h2><p className="customer-count">Customer #{customer.customer_id}</p>
      <dl className="customer-detail-grid">{[
        ['First name', customer.first_name], ['Last name', customer.last_name], ['Email', customer.email], ['Phone', customer.phone], ['City', customer.city], ['Country', customer.country], ['Created', customer.created_at ? new Date(customer.created_at).toLocaleString() : null]
      ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}</dl>
    </article>}
  </div></section>;
}
