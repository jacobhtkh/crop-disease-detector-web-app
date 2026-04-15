import { useState } from 'react';

export default function UploadImage() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const selectedFiles: File[] = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) return;

    // Validate all are images
    const validFiles = selectedFiles.filter((file) =>
      file.type.startsWith('image/'),
    );

    if (validFiles.length !== selectedFiles.length) {
      setMessage('Some files were not valid images.');
    }

    setFiles(validFiles);
    setPreviews(validFiles.map((file) => URL.createObjectURL(file)));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage('No files selected.');
      return;
    }

    const formData = new FormData();

    // IMPORTANT: key must match FastAPI param name: "files"
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      setLoading(true);
      setMessage('');

      const res = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      setMessage(`Uploaded: ${data.filename}`);
    } catch (err) {
      console.error(err);
      setMessage('Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <h1 className='text-3xl font-bold text-gray-800 mb-6'>
        Crop Disease Detector
      </h1>

      <div className='max-w-xl bg-white rounded-2xl shadow-md p-6'>
        <div className='mb-6'>
          <p className='text-gray-600 mb-3'>
            This will allow you to check if your crop has a disease.
          </p>
          <p className='text-sm font-medium text-gray-700 mb-2'>
            Supported crops:
          </p>
          <ul className='list-disc list-inside text-gray-600 text-sm space-y-1'>
            <li>Sugarcane</li>
            <li>Corn</li>
            <li>Potato</li>
            <li>Rice</li>
            <li>Wheat</li>
          </ul>
        </div>

        {/* MULTIPLE FILE INPUT */}
        <input
          type='file'
          accept='image/*'
          multiple
          onChange={handleChange}
          className='mb-4 block w-full text-sm text-gray-600
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:bg-green-100 file:text-green-700
            hover:file:bg-green-200'
        />

        {/* PREVIEWS GRID */}
        {previews.length > 0 && (
          <div className='grid grid-cols-2 gap-3 mb-4'>
            {previews.map((src, i) => (
              <img
                key={i}
                src={src}
                alt='preview'
                className='w-full h-32 object-cover rounded-lg border'
              />
            ))}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={loading}
          className='w-full py-2 px-4 rounded-xl bg-green-600 text-white font-semibold
            hover:bg-green-700 transition disabled:opacity-50'
        >
          {loading ? 'Uploading...' : 'Upload Images'}
        </button>

        {message && (
          <p className='mt-4 text-sm text-center text-gray-700'>{message}</p>
        )}
      </div>
    </div>
  );
}
