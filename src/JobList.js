import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './JobList.css'; // Ensure you have the CSS file for styling

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(10);

  useEffect(() => {
    const fetchJobs = async () => {
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
    };

    fetchJobs();
  }, []);

  // Get current jobs for pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <h2>Job Listings</h2>
      {error && <p className="error">{error}</p>}
      {currentJobs.length ? (
        <ul className="job-list">
          {currentJobs.map((job) => (
            <li key={job.job_fccid} className="job-item">
              <Link to={`/jobs/${job.job_fccid}`}>
                <h3>{job.job_title}</h3>
              </Link>
              <p><strong>Company:</strong> {job.company_name}</p>
              <p><strong>Location:</strong> {job.job_location}</p>
              <p><strong>Post Date:</strong> {new Date(job.post_date).toLocaleDateString()}</p>
              {job.salary && <p><strong>Salary:</strong> {job.salary.toLocaleString()}</p>}
              <p><strong>Type:</strong> {job.job_type}</p>
              <p><strong>Description:</strong> {job.job_description}</p>
              <a href={job.job_link} target="_blank" rel="noopener noreferrer">Job Link</a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No job listings available.</p>
      )}
      <div className="pagination">
        {Array.from({ length: Math.ceil(jobs.length / jobsPerPage) }, (_, index) => (
          <button key={index} onClick={() => paginate(index + 1)} className="page-item">
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default JobList;
