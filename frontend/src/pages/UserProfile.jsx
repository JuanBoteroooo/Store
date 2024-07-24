import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfile = () => {
  const [profile, setProfile] = useState({});
  const [role, setRole] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:3000/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setProfile(response.data);
        setRole(response.data.role_name);
        setProfileImageUrl(response.data.profile_image_url);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
      });
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleRoleUpdate = () => {
    const token = localStorage.getItem('token');
    axios.put('http://localhost:3000/profile/role', { role_id: role }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        alert('Role updated successfully');
        fetchProfile();
      })
      .catch(error => {
        console.error('Error updating role:', error);
      });
  };

  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleImageUpdate = () => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('profileImage', profileImage);

    axios.put('http://localhost:3000/profile/image', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        alert('Profile image updated successfully');
        fetchProfile();
      })
      .catch(error => {
        console.error('Error updating profile image:', error);
      });
  };

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      <div className="profile-details">
        <div className="profile-item">
          <label>Username:</label>
          <span>{profile.username}</span>
        </div>
        <div className="profile-item">
          <label>Email:</label>
          <span>{profile.email}</span>
        </div>
        <div className="profile-item">
          <label>Current Role:</label>
          <span>{profile.role_name}</span>
        </div>
        <div className="profile-item">
          <label htmlFor="role">Change Role:</label>
          <select id="role" value={role} onChange={handleRoleChange}>
            <option value="1">User</option>
            <option value="2">Seller</option>
            {/* Add more options if needed */}
          </select>
          <button onClick={handleRoleUpdate} className="btn">Update Role</button>
        </div>
        <div className="profile-item">
          <label htmlFor="profileImage">Profile Image:</label>
          <input type="file" id="profileImage" onChange={handleImageChange} />
          {profileImageUrl && <img src={`http://localhost:3000${profileImageUrl}`} alt="Profile" className="profile-image" />}
          <button onClick={handleImageUpdate} className="btn">Update Profile Image</button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
