import type { ImageResult } from '../types';
import { PredictionBar } from './PredictionBar';

type Props = {
  result: ImageResult;
};

export const ResultCard = ({ result }: Props) => {
  return (
    <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
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
          Diagnosis (Likelihood of state of health)
        </p>

        {result.predictions.length === 0 && (
          <p className='text-sm text-gray-400'>N/A</p>
        )}
        <ul className='space-y-3'>
          {result.predictions.map((pred, j) => (
            <PredictionBar
              key={j}
              label={pred.label}
              score={pred.score}
              isTop={j === 0}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
