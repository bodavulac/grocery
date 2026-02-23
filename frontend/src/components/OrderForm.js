import { useState, useEffect } from 'react';

const API_URL = '/api';

const CUSTOMER_NAMES = [
  'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Gupta', 'Vikram Singh',
  'Anita Desai', 'Rajesh Verma', 'Kavita Nair', 'Suresh Reddy', 'Meena Iyer',
  'Arjun Malhotra', 'Deepa Joshi', 'Karan Mehta', 'Pooja Rao', 'Nitin Agarwal',
  'Lakshmi Menon', 'Sanjay Bhat', 'Divya Pillai', 'Manoj Tiwari', 'Ritu Saxena'
];

function OrderForm() {
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${API_URL}/menu`);
        if (!res.ok) throw new Error('Failed to fetch menu');
        const data = await res.json();
        setMenuItems(data);
        const initialQty = {};
        data.forEach(item => { initialQty[item.id] = 0; });
        setQuantities(initialQty);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const generateRandomCustomer = () => {
    const name = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
    const firstDigit = [9, 8, 7, 6][Math.floor(Math.random() * 4)];
    const remaining = Math.floor(Math.random() * 900000000) + 100000000;
    setCustomerName(name);
    setCustomerMobile(`${firstDigit}${remaining}`);
    setSuccess('');
  };

  const handleQuantityChange = (itemId, value) => {
    const qty = Math.max(0, parseInt(value) || 0);
    setQuantities({ ...quantities, [itemId]: qty });
  };

  const calculateTotal = () => {
    return menuItems.reduce((sum, item) => {
      return sum + (item.price * (quantities[item.id] || 0));
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!customerName || !customerMobile) {
      setError('Please generate or enter customer details');
      return;
    }

    const orderItems = menuItems
      .filter(item => quantities[item.id] > 0)
      .map(item => ({
        menuItemId: item.id,
        name: item.name,
        quantity: quantities[item.id],
        price: item.price
      }));

    if (orderItems.length === 0) {
      setError('Please select at least one item');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerMobile,
          items: orderItems,
          totalAmount: calculateTotal()
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to place order');
      }

      setSuccess('Order placed successfully!');
      setCustomerName('');
      setCustomerMobile('');
      const resetQty = {};
      menuItems.forEach(item => { resetQty[item.id] = 0; });
      setQuantities(resetQty);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading menu items...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Place Order</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3>Customer Details</h3>
          <button type="button" className="btn btn-primary" onClick={generateRandomCustomer} style={{ marginBottom: '1rem' }}>
            Generate Random Customer
          </button>
          <div className="customer-info">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name"
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Mobile Number</label>
              <input
                type="text"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                placeholder="10-digit mobile"
                required
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Select Items</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Price (₹)</th>
                <th>Quantity</th>
                <th>Subtotal (₹)</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.filter(item => item.available).map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>₹{item.price}</td>
                  <td>
                    <input
                      type="number"
                      className="qty-input"
                      min="0"
                      value={quantities[item.id] || 0}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    />
                  </td>
                  <td>₹{item.price * (quantities[item.id] || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="order-total">
            Total: ₹{calculateTotal()}
          </div>
        </div>

        <button type="submit" className="btn btn-success" style={{ fontSize: '1.1rem', padding: '12px 30px' }}>
          Place Order
        </button>
      </form>
    </div>
  );
}

export default OrderForm;
