type Props = {
  previews: string[];
  files: File[];
  onRemove: (index: number) => void;
};

export const PreviewGrid = ({ previews, files, onRemove }: Props) => {
  if (previews.length === 0) return null;

  return (
    <div className='grid grid-cols-2 gap-3 mb-4'>
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
          <p className='px-3 py-2 text-sm text-gray-500 truncate'>
            {files[i]?.name}
          </p>
        </div>
      ))}
    </div>
  );
}
