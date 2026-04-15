import { useRef, useState } from 'react';

export default function UploadImage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const selectedFiles: File[] = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) return;

    const validFiles = selectedFiles.filter((file) =>
      file.type.startsWith('image/'),
    );

    if (validFiles.length !== selectedFiles.length) {
      setMessage('Some files were not valid images.');
    }

    setFiles((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [
      ...prev,
      ...validFiles.map((file) => URL.createObjectURL(file)),
    ]);

    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
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
    <div className='min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center'>
      <h1 className='text-3xl font-bold text-gray-800 mb-6 text-center'>
        Crop Disease Detector
      </h1>

      <div className='w-full max-w-xl bg-white rounded-2xl shadow-md p-6'>
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
        <div className='mb-4 flex items-center gap-3'>
          <button
            type='button'
            onClick={() => inputRef.current?.click()}
            className='py-2 px-4 rounded-lg bg-green-100 text-green-700 text-sm hover:bg-green-200'
          >
            Choose Files
          </button>
          {files.length === 0 && (
            <span className='text-sm text-gray-400'>No file chosen</span>
          )}
          <input
            ref={inputRef}
            type='file'
            accept='image/*'
            multiple
            onChange={handleChange}
            className='hidden'
          />
        </div>

        {/* FILE NAME LIST */}
        {files.length > 0 && (
          <ul className='mb-4 space-y-2'>
            {files.map((file, i) => (
              <li key={i} className='flex items-center justify-between text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2'>
                <span className='truncate mr-2'>{file.name}</span>
                <button
                  onClick={() => handleRemove(i)}
                  className='shrink-0 text-gray-400 hover:text-red-500 transition'
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* PREVIEWS GRID */}
        {previews.length > 0 && (
          <div className='grid grid-cols-3 gap-3 mb-4'>
            {previews.map((src, i) => (
              <img
                key={i}
                src={src}
                alt='preview'
                className='w-full h-28 object-cover rounded-lg border'
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
