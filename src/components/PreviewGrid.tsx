import type { Crop } from '../types';

type Props = {
  previews: string[];
  files: File[];
  selectedCropNamesForImages: string[];
  supportedCrops: Crop[];
  onRemove: (index: number) => void;
  onCropChange: (index: number, crop: string) => void;
};

export const PreviewGrid = ({
  previews,
  files,
  selectedCropNamesForImages,
  supportedCrops,
  onRemove,
  onCropChange,
}: Props) => {
  if (previews.length === 0) return null;

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4'>
      {previews.map((src, i) => (
        <div
          key={i}
          className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'
        >
          <div className='relative'>
            <img src={src} alt='preview' className='w-full h-32 object-cover' />
            <button
              onClick={() => onRemove(i)}
              className='absolute top-1.5 right-1.5 bg-white rounded-full w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 shadow transition text-xs'
            >
              ✕
            </button>
          </div>
          <div className='px-3 py-2 space-y-1'>
            <p className='text-sm text-gray-500 truncate'>{files[i]?.name}</p>
            <select
              value={selectedCropNamesForImages[i] ?? ''}
              onChange={(e) => onCropChange(i, e.target.value)}
              className='w-full text-sm rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-300'
            >
              <option value='' disabled hidden>
                Select the name of the crop
              </option>
              <option value='__from_filename__'>
                Get crop name from filename
              </option>
              {supportedCrops.map((c) => (
                <option key={c.crop} value={c.crop.toLowerCase()}>
                  {c.crop}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};
