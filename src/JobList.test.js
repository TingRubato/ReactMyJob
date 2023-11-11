import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { MemoryRouter } from 'react-router-dom';
import JobList from './JobList';

const mockAxios = new MockAdapter(axios);

describe('JobList', () => {
  const jobs = [
    {
      job_jk: '123',
      job_title: 'Software Engineer',
      company_name: 'Google',
      job_location: 'Mountain View, CA',
      post_date: '2022-01-01',
      salary: 100000,
      job_type: 'Full-time',
      job_description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      job_link: 'https://www.google.com/careers'
    },
    {
      job_jk: '456',
      job_title: 'Product Manager',
      company_name: 'Facebook',
      job_location: 'Menlo Park, CA',
      post_date: '2022-01-02',
      salary: 120000,
      job_type: 'Full-time',
      job_description: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
      job_link: 'https://www.facebook.com/careers'
    }
  ];

  beforeEach(() => {
    mockAxios.reset();
  });

  it('renders loading indicator when fetching jobs', async () => {
    mockAxios.onGet(`${process.env.REACT_APP_API_URL}/job-listings`).reply(200, jobs);

    render(
      <MemoryRouter>
        <JobList />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading jobs/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/job listings/i)).toBeInTheDocument();
    });
  });

  it('renders error message when unable to fetch jobs', async () => {
    mockAxios.onGet(`${process.env.REACT_APP_API_URL}/job-listings`).reply(500);

    render(
      <MemoryRouter>
        <JobList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/could not fetch jobs/i)).toBeInTheDocument();
    });
  });

  it('renders job list', async () => {
    mockAxios.onGet(`${process.env.REACT_APP_API_URL}/job-listings`).reply(200, jobs);

    render(
      <MemoryRouter>
        <JobList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/software engineer/i)).toBeInTheDocument();
      expect(screen.getByText(/google/i)).toBeInTheDocument();
      expect(screen.getByText(/mountain view, ca/i)).toBeInTheDocument();
      expect(screen.getByText(/01\/01\/2022/i)).toBeInTheDocument();
      expect(screen.getByText(/\$100,000/i)).toBeInTheDocument();
      expect(screen.getByText(/full-time/i)).toBeInTheDocument();
      expect(screen.getByText(/lorem ipsum dolor sit amet/i)).toBeInTheDocument();
      expect(screen.getByText(/job link/i)).toHaveAttribute('href', 'https://www.google.com/careers');
      expect(screen.getByText(/product manager/i)).toBeInTheDocument();
      expect(screen.getByText(/facebook/i)).toBeInTheDocument();
      expect(screen.getByText(/menlo park, ca/i)).toBeInTheDocument();
      expect(screen.getByText(/01\/02\/2022/i)).toBeInTheDocument();
      expect(screen.getByText(/\$120,000/i)).toBeInTheDocument();
      expect(screen.getByText(/full-time/i)).toBeInTheDocument();
      expect(screen.getByText(/sed ut perspiciatis unde omnis iste natus error/i)).toBeInTheDocument();
      expect(screen.getByText(/job link/i)).toHaveAttribute('href', 'https://www.facebook.com/careers');
    });
  });

  it('renders no job listings available message', async () => {
    mockAxios.onGet(`${process.env.REACT_APP_API_URL}/job-listings`).reply(200, []);

    render(
      <MemoryRouter>
        <JobList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no job listings available/i)).toBeInTheDocument();
    });
  });

  it('paginates job list', async () => {
    mockAxios.onGet(`${process.env.REACT_APP_API_URL}/job-listings`).reply(200, jobs);

    render(
      <MemoryRouter>
        <JobList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/software engineer/i)).toBeInTheDocument();
      expect(screen.getByText(/product manager/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/previous/i)).toBeDisabled();
    expect(screen.getByText(/1/i)).toHaveClass('active');
    expect(screen.getByText(/2/i)).not.toHaveClass('active');
    expect(screen.getByText(/next/i)).not.toBeDisabled();

    screen.getByText(/next/i).click();

    await waitFor(() => {
      expect(screen.getByText(/software engineer/i)).not.toBeInTheDocument();
      expect(screen.getByText(/product manager/i)).not.toBeInTheDocument();
      expect(screen.getByText(/software engineer 2/i)).toBeInTheDocument();
      expect(screen.getByText(/product manager 2/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/previous/i)).not.toBeDisabled();
    expect(screen.getByText(/1/i)).not.toHaveClass('active');
    expect(screen.getByText(/2/i)).toHaveClass('active');
    expect(screen.getByText(/next/i)).toBeDisabled();

    screen.getByText(/previous/i).click();

    await waitFor(() => {
      expect(screen.getByText(/software engineer/i)).toBeInTheDocument();
      expect(screen.getByText(/product manager/i)).toBeInTheDocument();
      expect(screen.getByText(/software engineer 2/i)).not.toBeInTheDocument();
      expect(screen.getByText(/product manager 2/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/previous/i)).toBeDisabled();
    expect(screen.getByText(/1/i)).toHaveClass('active');
    expect(screen.getByText(/2/i)).not.toHaveClass('active');
    expect(screen.getByText(/next/i)).not.toBeDisabled();
  });
});