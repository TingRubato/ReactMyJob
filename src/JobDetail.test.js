import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import axios from 'axios';
import JobDetail from './JobDetail';

jest.mock('axios');

describe('JobDetail', () => {
  const mockJob = {
    id: 123,
    job_title: 'Software Engineer',
    company_name: 'Google',
    job_link: 'https://www.google.com/careers',
    job_location: 'POINT(-122.084,37.422)',
    post_date: '2022-01-01',
    salary: 100000,
    job_type: 'Full-time',
    job_description: 'Lorem ipsum dolor sit amet',
  };

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockJob });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('renders job details', async () => {
    render(
      <MemoryRouter initialEntries={['/jobs/123']}>
        <Route path="/jobs/:job_fccid">
          <JobDetail />
        </Route>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(mockJob.job_title)).toBeInTheDocument();
      expect(screen.getByText(mockJob.company_name)).toBeInTheDocument();
      expect(screen.getByText(mockJob.job_link)).toBeInTheDocument();
      expect(screen.getByText(mockJob.job_location)).toBeInTheDocument();
      expect(screen.getByText(new Date(mockJob.post_date).toLocaleDateString())).toBeInTheDocument();
      expect(screen.getByText(mockJob.salary.toLocaleString())).toBeInTheDocument();
      expect(screen.getByText(mockJob.job_type)).toBeInTheDocument();
      expect(screen.getByText(mockJob.job_description)).toBeInTheDocument();
    });
  });

  test('handles apply click', async () => {
    window.open = jest.fn();

    render(
      <MemoryRouter initialEntries={['/jobs/123']}>
        <Route path="/jobs/:job_fccid">
          <JobDetail />
        </Route>
      </MemoryRouter>
    );

    await waitFor(() => {
      const applyButton = screen.getByText('Apply');
      applyButton.click();
      expect(window.open).toHaveBeenCalledWith(mockJob.job_link, '_blank');
    });
  });

  test('handles mark as applied click', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });

    render(
      <MemoryRouter initialEntries={['/jobs/123']}>
        <Route path="/jobs/:job_fccid">
          <JobDetail />
        </Route>
      </MemoryRouter>
    );

    await waitFor(() => {
      const markAsAppliedButton = screen.getByText('Not Applied');
      markAsAppliedButton.click();
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/mark-applied`,
        {
          jobId: mockJob.id,
          jobLink: mockJob.job_link,
          companyName: mockJob.company_name,
          companyLocation: mockJob.job_location,
          salary: mockJob.salary,
          jobType: mockJob.job_type,
          jobDescription: mockJob.job_description,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      expect(screen.getByText('Applied')).toBeInTheDocument();
    });
  });

  test('handles mark as applied failure', async () => {
    axios.post.mockRejectedValue(new Error('Failed to mark as applied'));

    render(
      <MemoryRouter initialEntries={['/jobs/123']}>
        <Route path="/jobs/:job_fccid">
          <JobDetail />
        </Route>
      </MemoryRouter>
    );

    await waitFor(() => {
      const markAsAppliedButton = screen.getByText('Not Applied');
      markAsAppliedButton.click();
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/mark-applied`,
        {
          jobId: mockJob.id,
          jobLink: mockJob.job_link,
          companyName: mockJob.company_name,
          companyLocation: mockJob.job_location,
          salary: mockJob.salary,
          jobType: mockJob.job_type,
          jobDescription: mockJob.job_description,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      expect(screen.getByText('Failed to mark as applied')).toBeInTheDocument();
    });
  });

  test('handles job details fetch error', async () => {
    axios.get.mockRejectedValue(new Error('Failed to fetch job details'));

    render(
      <MemoryRouter initialEntries={['/jobs/123']}>
        <Route path="/jobs/:job_fccid">
          <JobDetail />
        </Route>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Error fetching job details:')).toBeInTheDocument();
    });
  });
});