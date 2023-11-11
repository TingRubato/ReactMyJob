import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './JobList.css'; // Ensure you have the CSS file for styling

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;
  const [isLoading, setIsLoading] = useState(true);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/job-listings`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setJobs(response.data);
      } catch (err) {
        setError('Could not fetch jobs. Please try again later.');
      }
      setIsLoading(false);
    };

    fetchJobs();
  }, []);

  // Get current jobs for pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const prevPage = currentPage > 1;
  const nextPage = currentPage < Math.ceil(jobs.length / jobsPerPage);

  // Calculate the number of page buttons to display based on screen width
  const pageButtonWidth = 42; // Assume each page button is approximately 40px wide
  const maxPageButtons = Math.floor(windowWidth / pageButtonWidth);

  // Calculate the start and end page numbers
  let startPage, endPage;
  const totalPage = Math.ceil(jobs.length / jobsPerPage);
  if (totalPage <= maxPageButtons) {
    // Case 1: total pages is less than max, show all pages
    startPage = 1;
    endPage = totalPage;
  } else if (currentPage <= Math.floor(maxPageButtons / 2)) {
    // Case 2: current page is near the start, show first pages
    startPage = 1;
    endPage = maxPageButtons;
  } else if (currentPage + Math.floor(maxPageButtons / 2) >= totalPage) {
    // Case 3: current page is near the end, show last pages
    startPage = totalPage - maxPageButtons + 1;
    endPage = totalPage;
  } else {
    // Case 4: current page is somewhere in the middle, show pages around current
    startPage = currentPage - Math.floor(maxPageButtons / 2);
    endPage = startPage + maxPageButtons - 1;
  }
  
  // Generate the page buttons
  const pageButtons = [];
  for (let i = startPage; i <= endPage; i++) {
    pageButtons.push(
      <button key={i} onClick={() => paginate(i)} className={`page-item ${currentPage === i ? 'active' : ''}`}>
        {i}
      </button>
    );
  }

  return (
    <div className="job-list">
      {isLoading ? (
        <div className="loading-indicator">
          <p>Loading Jobs...</p>
        </div>
      ) : (
        <div>
          <h2>Job Listings</h2>
          {error && <p className="error">{error}</p>}
          {currentJobs.length ? (
            <ul className="job-list">
              {currentJobs.map((job) => (
                <li key={job.job_jk} className="job-item">
                  <Link to={`/jobs/${job.job_jk}`}>
                    <h3>{job.job_title}</h3>
                  </Link>
                  <p><strong>Company:</strong> {job.company_name}</p>
                  <p><strong>Location:</strong> {job.job_location}</p>
                  <p><strong>Post Date:</strong> {new Date(job.post_date).toLocaleDateString()}</p>
                  {job.salary && <p><strong>Salary:</strong> {job.salary.toLocaleString()}</p>}
                  <p><strong>Type:</strong> {job.job_type}</p>
                  <p><strong>Description:</strong> {job.job_description.length > 150 ? job.job_description.substring(0, 150) + '...' : job.job_description}</p>
                  <a href={job.job_link} target="_blank" rel="noopener noreferrer">Job Link</a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No job listings available.</p>
          )}
          <div className="pagination">
            {prevPage && <button onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>}
            {pageButtons}
            {nextPage && <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>}
          </div>
        </div>
      )}
    </div>
  );
}

export default JobList;