import { InfoTooltip } from './InfoTooltip';

type Props = {
  label: string;
  score: number;
  isTop: boolean;
  description: string;
};

export const PredictionBar = ({ label, score, isTop, description }: Props) => {
  const pct = (score * 100).toFixed(1);
  return (
    <li>
      <div className='flex justify-between items-center mb-1'>
        <span className='flex items-center gap-1 mr-2 min-w-0'>
          <span
            className={`text-sm truncate ${isTop ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
          >
            {label}
          </span>
          {description && <InfoTooltip text={description} />}
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
};
