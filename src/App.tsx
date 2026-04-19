import { useRef, useState } from 'react';

const MAX_FILES = 6;

export default function UploadImage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [atLimit, setAtLimit] = useState(false);

  const handleChange = (e) => {
    const selectedFiles: File[] = Array.from(e.target.files || []);

    if (inputRef.current) inputRef.current.value = '';

    if (selectedFiles.length === 0) return;

    const validFiles = selectedFiles.filter((file) =>
      file.type.startsWith('image/'),
    );

    if (validFiles.length !== selectedFiles.length) {
      setMessage('Some files were not valid images.');
    }

    setFiles((prev) => {
      const remaining = MAX_FILES - prev.length;
      if (remaining <= 0) {
        setAtLimit(true);
        return prev;
      }
      const filesToAdd = validFiles.slice(0, remaining);
      const newFiles = [...prev, ...filesToAdd];
      if (newFiles.length >= MAX_FILES) setAtLimit(true);
      return newFiles;
    });

    setPreviews((prev) => {
      const remaining = MAX_FILES - prev.length;
      if (remaining <= 0) return prev;
      return [
        ...prev,
        ...validFiles
          .slice(0, remaining)
          .map((file) => URL.createObjectURL(file)),
      ];
    });
  };

  const handleRemove = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length < MAX_FILES) setAtLimit(false);
      return updated;
    });
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

      const res = await fetch('http://localhost:8000/classify?top_k=5', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Classification failed');

      const data = await res.json();
      setMessage(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(err);
      setMessage('Classification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center'>
      <div className='w-full max-w-xl bg-white rounded-2xl shadow-md p-6'>
        <h1 className='text-3xl font-bold text-gray-800 mb-6 text-center'>
          Crop Disease Detector
        </h1>
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
            className='py-2 px-4 rounded-lg bg-green-100 text-green-700 text-sm hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-100'
            disabled={atLimit}
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

        {atLimit && (
          <p className='mb-4 text-sm text-center text-amber-600 bg-amber-50 rounded-lg py-2 px-3'>
            You can only add up to {MAX_FILES} photos at a time. Remove a photo
            to add more.
          </p>
        )}

        {/* FILE NAME LIST */}
        {files.length > 0 && (
          <ul className='mb-4 space-y-2'>
            {files.map((file, i) => (
              <li
                key={i}
                className='flex items-center justify-between text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2'
              >
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
          <div className='grid grid-cols-2 gap-3 mb-4'>
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
          {loading ? 'Analyzing...' : 'Analyze Images'}
        </button>

        {message && (
          <p className='mt-4 text-sm text-center text-gray-700'>{message}</p>
        )}
      </div>
    </div>
  );
}
