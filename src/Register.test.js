import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';

const mockAxios = new MockAdapter(axios);

describe('Register', () => {
  beforeEach(() => {
    mockAxios.reset();
    localStorage.clear();
  });

  it('renders the registration form', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByText(/register/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('submits the registration form with valid credentials', async () => {
    const username = 'testuser';
    const password = 'testpassword';
    mockAxios.onPost(`${process.env.REACT_APP_API_URL}/register`).reply(200, { username });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: username } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockAxios.history.post.length).toBe(1);
      expect(mockAxios.history.post[0].data).toBe(JSON.stringify({ username, password }));
      expect(screen.getByText(`User ${username} registered successfully!`)).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toHaveValue('');
      expect(screen.getByLabelText(/password/i)).toHaveValue('');
      expect(window.location.pathname).toBe('/login');
    });
  });

  it('displays an error message with invalid credentials', async () => {
    mockAxios.onPost(`${process.env.REACT_APP_API_URL}/register`).reply(400, { message: 'Username already taken.' });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'testpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockAxios.history.post.length).toBe(1);
      expect(mockAxios.history.post[0].data).toBe(JSON.stringify({ username: 'testuser', password: 'testpassword' }));
      expect(screen.getByText(/username already taken/i)).toBeInTheDocument();
    });
  });
});