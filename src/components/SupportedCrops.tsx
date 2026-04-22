import type { Crop } from '../types';

type Props = { crops: Crop[] };

export const SupportedCrops = ({ crops }: Props) => (
  <>
    <p className='text-sm font-medium text-gray-700 mb-3'>
      Supported crops and conditions:
    </p>
    <ul className='space-y-3'>
      {crops.map(({ crop, conditions }) => (
        <li key={crop}>
          <p className='text-sm font-semibold text-gray-700 mb-1'>{crop}</p>
          <ul className='space-y-0.5'>
            {conditions.map(({ name, description }) => (
              <li
                key={name}
                className='flex items-center gap-1.5 text-sm text-gray-500'
              >
                <span className='w-1.5 h-1.5 rounded-full bg-gray-600 shrink-0' />
                <span>{name}</span>
                <div className='relative group inline-flex'>
                  <span className='text-gray-400 hover:text-gray-600 cursor-default text-xs select-none'>
                    ⓘ
                  </span>
                  <div className='absolute left-0 bottom-full mb-1.5 w-60 bg-gray-800 text-white text-xs rounded-lg p-2.5 hidden group-hover:block z-10 leading-relaxed shadow-lg'>
                    {description}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  </>
);
