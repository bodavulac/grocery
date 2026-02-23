import { render, screen } from '@testing-library/react';
import App from './App';

// Mock fetch globally
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([])
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders Grocery Order Tracker title', () => {
  render(<App />);
  expect(screen.getByText('Grocery Order Tracker')).toBeInTheDocument();
});

test('renders navigation links', () => {
  render(<App />);
  expect(screen.getByText('Menu')).toBeInTheDocument();
  expect(screen.getByText('Place Order')).toBeInTheDocument();
  expect(screen.getByText('Orders')).toBeInTheDocument();
});

test('renders menu page by default with Menu Management heading', async () => {
  render(<App />);
  expect(screen.getByText('Menu Management')).toBeInTheDocument();
});

test('navbar has proper accessibility attributes', () => {
  render(<App />);
  const nav = screen.getByRole('navigation', { name: /main navigation/i });
  expect(nav).toBeInTheDocument();
});

test('navigation links are clickable', () => {
  render(<App />);
  const menuLink = screen.getByText('Menu');
  const orderLink = screen.getByText('Place Order');
  const ordersLink = screen.getByText('Orders');
  expect(menuLink.closest('a')).toHaveAttribute('href', '/');
  expect(orderLink.closest('a')).toHaveAttribute('href', '/order');
  expect(ordersLink.closest('a')).toHaveAttribute('href', '/orders');
});
