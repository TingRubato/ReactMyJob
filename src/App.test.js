import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders login page by default', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );
  const loginElement = screen.getByText(/login/i);
  expect(loginElement).toBeInTheDocument();
});

test('renders register page', () => {
  render(
    <MemoryRouter initialEntries={['/register']}>
      <App />
    </MemoryRouter>
  );
  const registerElement = screen.getByText(/register/i);
  expect(registerElement).toBeInTheDocument();
});

test('renders job list page', () => {
  render(
    <MemoryRouter initialEntries={['/jobs']}>
      <App />
    </MemoryRouter>
  );
  const jobListElement = screen.getByText(/job list/i);
  expect(jobListElement).toBeInTheDocument();
});

test('renders job detail page', () => {
  render(
    <MemoryRouter initialEntries={['/jobs/123']}>
      <App />
    </MemoryRouter>
  );
  const jobDetailElement = screen.getByText(/job detail/i);
  expect(jobDetailElement).toBeInTheDocument();
});

test('renders page not found', () => {
  render(
    <MemoryRouter initialEntries={['/unknown']}>
      <App />
    </MemoryRouter>
  );
  const pageNotFoundElement = screen.getByText(/page not found/i);
  expect(pageNotFoundElement).toBeInTheDocument();
});