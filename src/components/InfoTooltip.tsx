type Props = { text: string };

export const InfoTooltip = ({ text }: Props) => (
  <span className='relative group inline-flex shrink-0'>
    <span className='text-gray-400 hover:text-gray-600 cursor-default text-xs select-none'>
      ⓘ
    </span>
    <span className='absolute left-0 bottom-full mb-1.5 w-60 bg-gray-800 text-white text-xs rounded-lg p-2.5 hidden group-hover:block z-10 leading-relaxed shadow-lg'>
      {text}
    </span>
  </span>
);
