import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    age: '',
    allergies: [],
    customAllergy: '',
    profileImage: '',
  });

  const allergyOptions = ["Peanuts", "Dairy", "Gluten", "Fragrance", "Latex", "Other"];

useEffect(() => {
  const name = sessionStorage.getItem('userName') || '';
  const age = sessionStorage.getItem('userAge') || '';
  let allergiesRaw = sessionStorage.getItem('userAllergies');
  let allergies = [];
  try {
    allergies = JSON.parse(allergiesRaw);
    if (!Array.isArray(allergies)) throw new Error();
  } catch {
    allergies = allergiesRaw ? allergiesRaw.split(',').map(a => a.trim()) : [];
  }

  let customAllergy = '';
  const filteredAllergies = allergies.filter((a) => {
    if (allergyOptions.includes(a)) {
      return true;
    } else {
      customAllergy = a;
      return true;
    }
  });

  setForm({ name, age, allergies: filteredAllergies, customAllergy, profileImage: '' });
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // <-- No need to add 'navigate' because navigate is not used here
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAllergyChange = (e) => {
    const { value, checked } = e.target;
    setForm(prev => {
      let updated;
      if (checked) {
        updated = [...prev.allergies, value];
      } else {
        updated = prev.allergies.filter(a => a !== value);
        if (value === "Other") {
          return { ...prev, allergies: updated, customAllergy: '' };
        }
      }
      return { ...prev, allergies: updated };
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let finalAllergies = [...form.allergies];
    if (finalAllergies.includes("Other")) {
      finalAllergies = finalAllergies.filter(a => a !== "Other");
      if (form.customAllergy.trim() !== '') {
        finalAllergies.push(form.customAllergy.trim());
      }
    }

    const payload = {
      email: sessionStorage.getItem('currentUserEmail'),
      name: form.name,
      age: form.age,
      allergies: finalAllergies,
      profileImage: form.profileImage,
    };

    fetch("http://localhost:8000/api/profile/update/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => { throw new Error(data.error || "Profile update failed") });
        }
        return response.json();
      })
      .then(updatedProfile => {
        // Only update name, age, allergies locally
        sessionStorage.setItem('userName', updatedProfile.name);
        sessionStorage.setItem('userAge', updatedProfile.age);
        sessionStorage.setItem('userAllergies', JSON.stringify(updatedProfile.allergies));
        // 🚫 No saving Base64 images into localStorage anymore
        toast.success('Profile updated successfully!');
        navigate('/profile');
      })
      .catch(error => {
        toast.error(error.message || 'Profile update failed');
      });
  };

  return (
    <div className="page-content container auth-container">
      <h2>Edit Your Profile</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div style={{ textAlign: 'center' }}>
          <label><strong>Profile Image:</strong></label><br />
          {form.profileImage && (
            <img
              src={form.profileImage}
              alt="Preview"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
                margin: '10px 0'
              }}
            />
          )}
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <select name="age" value={form.age} onChange={handleChange} required>
          <option value="">Select Age Bracket</option>
          <option value="18-25">18–25</option>
          <option value="26-35">26–35</option>
          <option value="36-45">36–45</option>
          <option value="46+">46+</option>
        </select>

        <div className="allergy-group">
          <label><strong>Allergies:</strong></label><br />
          {allergyOptions.map((option) => (
            <label key={option} style={{ marginRight: '1rem' }}>
              <input
                type="checkbox"
                value={option}
                checked={form.allergies.includes(option) || (option === "Other" && form.customAllergy)}
                onChange={handleAllergyChange}
              />
              {option}
            </label>
          ))}
          {(form.allergies.includes("Other") || form.customAllergy) && (
            <input
              type="text"
              name="customAllergy"
              placeholder="Specify other allergies"
              value={form.customAllergy}
              onChange={handleChange}
              required={form.allergies.includes("Other")}
              style={{ display: 'block', marginTop: '0.5rem' }}
            />
          )}
        </div>

        <button type="submit" className="btn btn-primary">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfile;
