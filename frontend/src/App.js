import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MenuPage from './components/MenuPage';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';
import OrderDetail from './components/OrderDetail';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav className="navbar" aria-label="Main navigation">
          <div className="navbar-brand">
            <h1>Grocery Order Tracker</h1>
          </div>
          <div className="navbar-links" role="menubar">
            <Link to="/" role="menuitem">Menu</Link>
            <Link to="/order" role="menuitem">Place Order</Link>
            <Link to="/orders" role="menuitem">Orders</Link>
          </div>
        </nav>
        <main className="container">
          <Routes>
            <Route path="/" element={<MenuPage />} />
            <Route path="/order" element={<OrderForm />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
