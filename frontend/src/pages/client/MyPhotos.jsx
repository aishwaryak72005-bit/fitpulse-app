import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiCamera, FiUpload, FiTrash2 } from 'react-icons/fi';

export const MyPhotos = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form files state
  const [frontPhoto, setFrontPhoto] = useState(null);
  const [sidePhoto, setSidePhoto] = useState(null);
  const [backPhoto, setBackPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await api.get('/progress-photos/');
      setPhotos(res.data);
    } catch (err) {
      console.error('Error fetching progress photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!frontPhoto && !sidePhoto && !backPhoto) {
      alert('Please select at least one photo (Front, Side, or Back).');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    if (frontPhoto) formData.append('front_photo', frontPhoto);
    if (sidePhoto) formData.append('side_photo', sidePhoto);
    if (backPhoto) formData.append('back_photo', backPhoto);

    try {
      await api.post('/progress-photos/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Progress photos uploaded successfully!');
      setFrontPhoto(null);
      setSidePhoto(null);
      setBackPhoto(null);
      fetchPhotos();
    } catch (err) {
      alert('Error uploading photos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
        <h1 className="text-2xl font-extrabold text-white">My Progress Photos</h1>
        <p className="text-sm text-gray-400 mt-1">Upload front, side and back photos to track your physical transformation</p>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="bg-gray-800 border border-gray-700 p-6 rounded-2xl space-y-4 shadow-xl">
        <h3 className="font-bold text-white text-base border-b border-gray-700 pb-3">Upload New Photos</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Front Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFrontPhoto(e.target.files[0])}
              className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Side Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSidePhoto(e.target.files[0])}
              className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Back Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBackPhoto(e.target.files[0])}
              className="bg-gray-900 border border-gray-700 w-full px-3 py-2 rounded-xl text-white text-xs"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-900/30 flex items-center justify-center"
        >
          <FiUpload className="mr-2" /> {uploading ? 'Uploading...' : 'Upload Photos'}
        </button>
      </form>

      {/* Photo Gallery Grid */}
      <div className="space-y-4">
        <h3 className="font-bold text-white text-lg">Photo Transformation History</h3>
        {loading ? (
          <div className="p-6 text-center text-emerald-400">Loading gallery...</div>
        ) : photos.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 p-8 rounded-2xl text-center text-gray-400">
            No progress photos uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((p) => (
              <div key={p.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-4 space-y-3 shadow-xl">
                <span className="text-xs font-semibold text-emerald-400 font-mono">
                  Upload Date: {new Date(p.uploaded_at).toLocaleDateString()}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-gray-400 block mb-1">Front</span>
                    <img src={p.front_photo || 'https://via.placeholder.com/150'} alt="Front" className="w-full h-24 object-cover rounded-lg border border-gray-700" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block mb-1">Side</span>
                    <img src={p.side_photo || 'https://via.placeholder.com/150'} alt="Side" className="w-full h-24 object-cover rounded-lg border border-gray-700" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block mb-1">Back</span>
                    <img src={p.back_photo || 'https://via.placeholder.com/150'} alt="Back" className="w-full h-24 object-cover rounded-lg border border-gray-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
