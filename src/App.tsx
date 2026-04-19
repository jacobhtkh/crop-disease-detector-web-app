import { useRef, useState } from 'react';

const MAX_FILES = 6;

type Prediction = { label: string; score: number };

type ImageResult = {
  filename: string;
  cropInImage?: string;
  predictions: Prediction[];
};

function formatLabel(label: string) {
  return label.replace(/___/g, ' — ').replace(/_/g, ' ');
}

export default function UploadImage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [atLimit, setAtLimit] = useState(false);
  const [results, setResults] = useState<ImageResult[]>([]);

  const handleChange = (e) => {
    const selectedFiles: File[] = Array.from(e.target.files || []);

    if (inputRef.current) inputRef.current.value = '';

    if (selectedFiles.length === 0) return;

    setMessage('');
    setResults([]);

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
    setMessage('');
    setResults([]);
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
      setResults([]);

      const res = await fetch('http://localhost:8000/classify?top_k=5', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Classification failed');

      const data: { results: ImageResult[] } = await res.json();
      setResults(data.results);
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

        {/* RESULTS */}
        {results.length > 0 && (
          <div className='mt-6 space-y-4'>
            {results.map((result, i) => (
              <div key={i} className='border rounded-xl p-4 bg-gray-50'>
                {previews[i] && (
                  <img
                    src={previews[i]}
                    alt={result.filename}
                    className='w-full h-40 object-cover rounded-lg mb-3'
                  />
                )}
                <p className='text-sm font-semibold text-gray-800 truncate mb-1'>
                  {result.filename}
                </p>
                <p className='text-xs text-gray-500 mb-3 capitalize'>
                  Crop detected: {result.cropInImage || 'N/A'}
                </p>
                <ul className='space-y-2'>
                  {result.predictions.map((pred, j) => (
                    <li key={j}>
                      <div className='flex justify-between text-xs text-gray-700 mb-1'>
                        <span>{formatLabel(pred.label)}</span>
                        <span>{(pred.score * 100).toFixed(1)}%</span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-1.5'>
                        <div
                          className='bg-green-500 h-1.5 rounded-full'
                          style={{ width: `${(pred.score * 100).toFixed(1)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
