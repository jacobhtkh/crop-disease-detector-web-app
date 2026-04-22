import { useRef, useState } from 'react';
import type { ImageResult } from './types';
import { PreviewGrid } from './components/PreviewGrid';
import { ResultCard } from './components/ResultCard';

const MAX_FILES = 6;

export const App = () => {
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

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body.error && body.limit) {
          throw new Error(
            `Analysis failed. Reason: ${body.error} as it is ${body.limit}`,
          );
        }
        throw new Error(
          `Analysis failed. Reason: ${body.error ?? `Error ${res.status} ${res.statusText}`}`,
        );
      }

      const data: { results: Omit<ImageResult, 'previewUrl'>[] } =
        await res.json();

      const resultsWithPreviewUrl: ImageResult[] = data.results.map((r, i) => ({
        ...r,
        previewUrl: previews[i],
      }));

      resetUploadState();
      setResults(resultsWithPreviewUrl);
    } catch (err) {
      console.error(err);
      setMessage(err.message);
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
              <p className='text-gray-600 mb-4'>
                Check up to {MAX_FILES} crop images for signs of disease.
                Remember this is experimental and the model used has bias and
                limitations.
              </p>
              <p className='text-sm font-medium text-gray-700 mb-3'>
                Supported crops and conditions:
              </p>
              <ul className='space-y-3'>
                {[
                  {
                    crop: 'Corn',
                    conditions: [
                      'Common Rust',
                      'Gray Leaf Spot',
                      'Leaf Blight',
                      'Healthy',
                    ],
                  },
                  {
                    crop: 'Potato',
                    conditions: ['Early Blight', 'Late Blight', 'Healthy'],
                  },
                  {
                    crop: 'Rice',
                    conditions: ['Brown Spot', 'Leaf Blast', 'Healthy'],
                  },
                  {
                    crop: 'Wheat',
                    conditions: ['Brown Rust', 'Yellow Rust', 'Healthy'],
                  },
                ].map(({ crop, conditions }) => (
                  <li key={crop}>
                    <p className='text-sm font-semibold text-gray-700 mb-1'>
                      {crop}
                    </p>
                    <ul className='list-disc list-inside space-y-0.5'>
                      {conditions.map((condition) => (
                        <li key={condition} className='text-sm text-gray-500'>
                          {condition}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
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

            <PreviewGrid
              previews={previews}
              files={files}
              onRemove={handleRemove}
            />

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
            <h2 className='text-2xl font-semibold text-gray-800 text-center'>
              Analysis Results
            </h2>
            {results.map((result, i) => (
              <ResultCard key={i} result={result} />
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
};
