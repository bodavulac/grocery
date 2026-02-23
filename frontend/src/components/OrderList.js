import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = '/api/orders';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Orders</h2>
        <button className="btn btn-secondary" onClick={fetchOrders}>Refresh</button>
      </div>

      {error && <div className="error">{error}</div>}

      {orders.length === 0 ? (
        <div className="loading">No orders yet. Place your first order!</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Mobile</th>
              <th>Total (₹)</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id.substring(0, 8)}...</td>
                <td>{order.customerName}</td>
                <td>{order.customerMobile}</td>
                <td>₹{order.totalAmount}</td>
                <td>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <select
                      className="status-select"
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                    </select>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default OrderList;
