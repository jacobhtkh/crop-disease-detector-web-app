import { useRef, useState } from 'react';

const MAX_FILES = 6;

type Prediction = { label: string; score: number };

type ImageResult = {
  filename: string;
  cropInImage?: string;
  predictions: Prediction[];
  previewUrl: string;
};

function formatLabel(label: string) {
  return label.replace(/___/g, ' — ').replace(/_/g, ' ');
}

export default function UploadImage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [atLimit, setAtLimit] = useState(false);
  const [results, setResults] = useState<ImageResult[]>([]);

  const resetUploadState = () => {
    setFiles([]);
    setPreviews([]);
    setAtLimit(false);
    setMessage('');
  };

  const handleChange = (e) => {
    const selectedFiles: File[] = Array.from(e.target.files || []);

    if (inputRef.current) inputRef.current.value = '';

    if (selectedFiles.length === 0) return;

    setMessage('');

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
    setFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length < MAX_FILES) setAtLimit(false);
      return updated;
    });
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    results.forEach((r) => URL.revokeObjectURL(r.previewUrl));
    setResults([]);
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

      const data: { results: Omit<ImageResult, 'previewUrl'>[] } =
        await res.json();

      const enrichedResults: ImageResult[] = data.results.map((r, i) => ({
        ...r,
        previewUrl: previews[i],
      }));

      resetUploadState();
      setResults(enrichedResults);
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

        {/* UPLOAD SECTION */}
        {results.length === 0 && (
          <>
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

            <p className='mb-6 text-sm text-gray-500'>
              Better results if filenames have the crop in the image's name in
              them.
            </p>

            {atLimit && (
              <p className='mb-4 text-sm text-center text-amber-600 bg-amber-50 rounded-lg py-2 px-3'>
                You can only add up to {MAX_FILES} photos at a time. Remove a
                photo to add more.
              </p>
            )}

            {/* PREVIEWS GRID WITH FILENAMES */}
            {previews.length > 0 && (
              <div className='grid grid-cols-2 gap-3 mb-4'>
                {previews.map((src, i) => (
                  <div
                    key={i}
                    className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'
                  >
                    <div className='relative'>
                      <img
                        src={src}
                        alt='preview'
                        className='w-full h-32 object-cover'
                      />
                      <button
                        onClick={() => handleRemove(i)}
                        className='absolute top-1.5 right-1.5 bg-white rounded-full w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 shadow transition text-xs'
                      >
                        ✕
                      </button>
                    </div>
                    <p className='px-3 py-2 text-sm text-gray-500 truncate'>
                      {files[i]?.name}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={loading}
              className='w-full mt-2 py-4 px-4 rounded-xl bg-green-600 text-white text-lg font-semibold
                hover:bg-green-700 transition disabled:opacity-50'
            >
              {loading ? 'Analyzing...' : 'Analyze Images'}
            </button>

            {message && (
              <p className='mt-4 text-sm text-center text-gray-700'>
                {message}
              </p>
            )}
          </>
        )}

        {/* RESULTS */}
        {results.length > 0 && (
          <div className='space-y-4'>
            <h2 className='text-lg font-semibold text-gray-800 text-center'>
              Analysis Results
            </h2>
            {results.map((result, i) => (
              <div
                key={i}
                className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'
              >
                <div className='relative'>
                  <img
                    src={result.previewUrl}
                    alt={result.filename}
                    className='w-full h-48 object-cover'
                  />
                  {result.cropInImage && (
                    <span className='absolute bottom-2 left-2 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded-full capitalize'>
                      {result.cropInImage}
                    </span>
                  )}
                </div>

                <div className='p-4'>
                  <p className='text-sm font-medium text-gray-500 truncate mb-4'>
                    {result.filename}
                  </p>

                  <p className='text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3'>
                    Diagnosis
                  </p>

                  {result.predictions.length === 0 && (
                    <p className='text-sm text-gray-400'>N/A</p>
                  )}
                  <ul className='space-y-3'>
                    {result.predictions.map((pred, j) => {
                      const pct = (pred.score * 100).toFixed(1);
                      const isTop = j === 0;
                      return (
                        <li key={j}>
                          <div className='flex justify-between items-center mb-1'>
                            <span
                              className={`text-sm truncate mr-2 ${isTop ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
                            >
                              {formatLabel(pred.label)}
                            </span>
                            <span
                              className={`text-sm shrink-0 ${isTop ? 'font-bold text-green-600' : 'text-gray-400'}`}
                            >
                              {pct}%
                            </span>
                          </div>
                          <div className='w-full bg-gray-100 rounded-full h-2'>
                            <div
                              className={`h-2 rounded-full ${isTop ? 'bg-green-500' : 'bg-gray-300'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))}
            <button
              onClick={handleReset}
              className='w-full mt-2 py-4 px-4 rounded-xl bg-green-600 text-white font-semibold
                hover:bg-green-700 transition'
            >
              Analyze More Images
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
