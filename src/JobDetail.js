import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './JobDetail.css'; // Ensure you have the CSS file for styling
import { useMemo } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";


function JobDetail() {
  const { job_jk } = useParams(); // Corrected to job_jk
  const [job, setJob] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState('Not Applied');

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/job-listings/${job_jk}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setJob(response.data);
      } catch (err) {
        // Ideally, you should handle the error more explicitly here
        console.error('Error fetching job details:', err);
      }
    };

    fetchJobDetail();
  }, [job_jk]); // Dependency array updated to job_jk

  const handleApplyClick = () => {
    if (job && job.job_link) {
      window.open(job.job_link, '_blank');
    }
  };

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  });
  const center = useMemo(() => ({ lat: 38.624691, lng: -90.184776 }), []);


  const handleMarkAsApplied = async () => {
    if (!job) return;  // Check if the job details are available

    // Create an object with the structure your backend expects
    const jobApplication = {
      jobId: job.id, // Assuming 'id' is the correct field and corresponds to 'jobId'
      jobLink: job.job_link,
      companyName: job.company_name,
      companyLocation: job.job_location,
      salary: job.salary || 'Not provided', // Use a default value or omit if the salary is null
      jobType: job.job_type,
      jobDescription: job.job_description
    };

    try {
      // Send the POST request with the jobApplication object
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/mark-applied`, jobApplication, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Retrieve the JWT from localStorage
        }
      });

      // Update the application status based on the response from the backend
      if (response.data.success) {
        setApplicationStatus('Applied');
      } else {
        setApplicationStatus('Failed to mark as applied');
      }
    } catch (err) {
      console.error('Error marking job as applied:', err);
      setApplicationStatus('Failed to mark as applied');
    }
  };


  if (!job) {
    return <div>Loading...</div>;
  }
  // 解析地理坐标
  const coordinates = job.job_location.match(/POINT\((.+)\s(.+)\)/);
  const lat = parseFloat(coordinates[2]);
  const lon = parseFloat(coordinates[1]);

  return (
    <div className="job-detail">
      <div className="job-info">
        <h2>{job.job_title}</h2>
        <p><strong>Company:</strong> {job.company_name}</p>
        <p><strong>Link:</strong> <a href={job.job_link} target="_blank" rel="noopener noreferrer">{job.job_link}</a></p>
        <p><strong>Location:</strong> {job.job_location}</p>
        <p><strong>Post Date:</strong> {new Date(job.post_date).toLocaleDateString()}</p>
        {job.salary && <p><strong>Salary:</strong> {job.salary.toLocaleString()}</p>}
        <p><strong>Type:</strong> {job.job_type}</p>
        <p><strong>Description:</strong> {job.job_description}</p>
        <button onClick={handleApplyClick}>Apply</button>
        <button onClick={handleMarkAsApplied}>{applicationStatus}</button>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
      <div className="App">
        {!isLoaded ? (
          <h1>Loading...</h1>
        ) : (
          <GoogleMap
            mapContainerClassName="map-container"
            center={center}
            zoom={10}
          >
            <Marker position={{ lat: lat, lng: lon }} />
          </GoogleMap>
        )}
      </div>
    </div>
  );
}

export default JobDetail;
