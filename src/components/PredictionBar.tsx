import { formatLabel } from '../helpers';

type Props = {
  label: string;
  score: number;
  isTop: boolean;
};

export const PredictionBar = ({ label, score, isTop }: Props) => {
  const pct = (score * 100).toFixed(1);
  return (
    <li>
      <div className='flex justify-between items-center mb-1'>
        <span
          className={`text-sm truncate mr-2 ${isTop ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
        >
          {formatLabel(label)}
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
}
