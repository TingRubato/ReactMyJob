import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

const mockAxios = new MockAdapter(axios);

describe('Login', () => {
  beforeEach(() => {
    mockAxios.reset();
    localStorage.clear();
  });

  it('renders the login form', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register here/i })).toBeInTheDocument();
  });

  it('submits the login form with valid credentials', async () => {
    const accessToken = 'fake_access_token';
    mockAxios.onPost(`${process.env.REACT_APP_API_URL}/login`).reply(200, { accessToken });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'testpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockAxios.history.post.length).toBe(1);
      expect(mockAxios.history.post[0].data).toBe(JSON.stringify({ username: 'testuser', password: 'testpassword' }));
      expect(localStorage.getItem('token')).toBe(accessToken);
      expect(window.location.pathname).toBe('/jobs');
    });
  });

  it('displays an error message with invalid credentials', async () => {
    mockAxios.onPost(`${process.env.REACT_APP_API_URL}/login`).reply(401);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'testpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockAxios.history.post.length).toBe(1);
      expect(mockAxios.history.post[0].data).toBe(JSON.stringify({ username: 'testuser', password: 'testpassword' }));
      expect(localStorage.getItem('token')).toBe(null);
      expect(screen.getByText(/failed to login/i)).toBeInTheDocument();
    });
  });
});