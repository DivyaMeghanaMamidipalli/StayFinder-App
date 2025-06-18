import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const HostForm = () => {
  const { user, token } = useContext(AppContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: '',
    price: '',
    guests: '',
    bedrooms: '',
    bathrooms: '',
    amenities: [],
    images: []
  });

  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenitiesChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => {
      const newAmenities = prev.amenities.includes(value)
        ? prev.amenities.filter((a) => a !== value)
        : [...prev.amenities, value];
      return { ...prev, amenities: newAmenities };
    });
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      images: Array.from(e.target.files)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const body = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'images') {
        value.forEach((file) => body.append('images', file));
      } else if (key === 'amenities') {
        value.forEach((a) => body.append('amenities', a));
      } else {
        body.append(key, value);
      }
    });

    try {
      const res = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body
      });

      const data = await res.json();
      if (res.ok) {
        navigate('/');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error(err);
      setError('Error creating listing');
    }
  };

  if (!user || user.role !== 'host') {
    return <div className="p-6">You must be a host to add Properties.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6">Create New Listing</h2>
      {error && <div className="mb-4 text-red-600 font-medium">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="title" onChange={handleInputChange} placeholder="Title" required className="input border p-2 rounded-md w-full" />
          <input name="location" onChange={handleInputChange} placeholder="Location" required className="input border p-2 rounded-md w-full" />
          <input name="type" onChange={handleInputChange} placeholder="Type (e.g., Villa, Cabin)" required className="input border p-2 rounded-md w-full" />
          <input type="number" name="price" onChange={handleInputChange} placeholder="Price per night" required className="input border p-2 rounded-md w-full" />
          <input type="number" name="guests" onChange={handleInputChange} placeholder="Max Guests" required className="input border p-2 rounded-md w-full" />
          <input type="number" name="bedrooms" onChange={handleInputChange} placeholder="Bedrooms" required className="input border p-2 rounded-md w-full" />
          <input type="number" name="bathrooms" onChange={handleInputChange} placeholder="Bathrooms" required className="input border p-2 rounded-md w-full" />
        </div>

        <textarea
          name="description"
          onChange={handleInputChange}
          placeholder="Description"
          required
          className="input border p-2 rounded-md w-full h-28"
        />

        <div className="space-y-2">
          <p className="font-medium">Select Amenities:</p>
          <div className="flex flex-wrap gap-4">
            {['wifi', 'pool', 'parking', 'kitchen', 'garden'].map((a) => (
              <label key={a} className="flex items-center gap-2 text-sm">
                <input type="checkbox" value={a} onChange={handleAmenitiesChange} />
                <span>{a}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-medium">Upload Images:</p>
          <input type="file" multiple accept="image/*" onChange={handleImageChange} className="file:border file:p-2 rounded-md" />
        </div>

        <button
          type="submit"
          className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-2 rounded-md transition"
        >
          Create Listing
        </button>
      </form>
    </div>
  );
};

export default HostForm;
