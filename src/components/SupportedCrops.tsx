import type { Crop } from '../types';
import { InfoTooltip } from './InfoTooltip';

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
                className='flex items-center gap-1 text-sm text-gray-500'
              >
                <span className='w-1.5 h-1.5 rounded-full bg-gray-600 shrink-0' />
                <span>{name}</span>
                <InfoTooltip text={description} />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  </>
);
