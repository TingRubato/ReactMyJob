import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './JobList.css'; // Ensure you have the CSS file for styling
/**
 * Component that displays a list of job listings with pagination.
 * @returns {JSX.Element} The JobList component.
 */
function JobList() {
  const [jobs, setJobs] = useState([]);
  const [appliedStatus, setAppliedStatus] = useState({});
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/job-listings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setJobs(response.data);
        response.data.forEach(job => checkIfApplied(job.job_jk));
      } catch (err) {
        setError('Could not fetch jobs. Please try again later.');
      }
      setIsLoading(false);
    };

    fetchJobs();
  }, []);

  const checkIfApplied = async (job_jk) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/is-applied/${job_jk}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAppliedStatus(prevStatus => ({ ...prevStatus, [job_jk]: response.data.isApplied }));
    } catch (err) {
      console.error('Error checking applied status:', err);
    }
  };

  // Get current jobs for pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  // const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const prevPage = currentPage > 1;
  const nextPage = currentPage < Math.ceil(jobs.length / jobsPerPage);

  // Calculate the number of page buttons to display based on screen widt
  // Calculate the start and end page numbers
  // Determine the start and end page numbers for pagination
  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  const maxPageButtons = 10;

let startPage, endPage;
if (totalPages <= maxPageButtons) {
  // Case: Total pages less than or equal to 10
  startPage = 1;
  endPage = totalPages;
} else {
  // Case: More than 10 pages
  const maxPagesBeforeCurrentPage = Math.floor(maxPageButtons / 2);
  const maxPagesAfterCurrentPage = Math.ceil(maxPageButtons / 2) - 1;
  if (currentPage <= maxPagesBeforeCurrentPage) {
    // Near the beginning; no ellipsis at start
    startPage = 1;
    endPage = maxPageButtons;
  } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
    // Near the end; no ellipsis at end
    startPage = totalPages - maxPageButtons + 1;
    endPage = totalPages;
  } else {
    // Somewhere in the middle; ellipsis at both ends
    startPage = currentPage - maxPagesBeforeCurrentPage;
    endPage = currentPage + maxPagesAfterCurrentPage;
  }
}
  
const pageButtons = [];
if (startPage > 1) {
  pageButtons.push(<span key="ellipsis-start">...</span>);
}
for (let i = startPage; i <= endPage; i++) {
  pageButtons.push(
    <button key={i} onClick={() => paginate(i)} className={`page-item ${currentPage === i ? 'active' : ''}`}>
      {i}
    </button>
  );
}
if (endPage < totalPages) {
  pageButtons.push(<span key="ellipsis-end">...</span>);
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
          {jobs.length ? (
            <ul className="job-list">
              {jobs.slice(indexOfFirstJob, indexOfLastJob).map((job) => (
                <li key={job.job_jk} className="job-item">
                  {appliedStatus[job.job_jk] && <img src={require('./yes.ico')} alt="Applied" />}
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
        </div>
      )}
      <div className="pagination">
            {prevPage && <button onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>}
            {pageButtons}
            {nextPage && <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>}
          </div>
    </div>
  );
}

export default JobList;