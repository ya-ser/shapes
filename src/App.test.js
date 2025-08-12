import { render, screen } from '@testing-library/react';
import App from './App';

test('renders SHAPES logo in header', () => {
  render(<App />);
  const logoElement = screen.getByRole('banner').querySelector('.logo');
  expect(logoElement).toHaveTextContent('SHAPES');
});

test('renders main heading', () => {
  render(<App />);
  const headingElement = screen.getByRole('heading', { level: 1 });
  expect(headingElement).toHaveTextContent('SHAPES is where concepts become creations');
});

test('renders navigation links', () => {
  render(<App />);
  const aboutLink = screen.getByRole('link', { name: /about/i });
  const methodLink = screen.getByRole('link', { name: /method/i });
  const contactLink = screen.getByRole('link', { name: /contact/i });
  
  expect(aboutLink).toBeInTheDocument();
  expect(methodLink).toBeInTheDocument();
  expect(contactLink).toBeInTheDocument();
});
