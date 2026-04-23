import { useState, useRef, useEffect } from 'react';

type Props = { text: string };

export const InfoTooltip = ({ text }: Props) => {
  const [tapped, setTapped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!tapped) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setTapped(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [tapped]);

  return (
    <span ref={ref} className='relative inline-flex shrink-0'>
      <span
        className='text-gray-400 hover:text-gray-600 cursor-default text-xs select-none'
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(event) => {
          if (
            !(
              event.nativeEvent instanceof PointerEvent &&
              event.nativeEvent.pointerType === 'mouse'
            )
          )
            setTapped((tapped) => !tapped);
        }}
      >
        ⓘ
      </span>
      {(hovered || tapped) && (
        <span className='absolute left-0 bottom-full mb-1.5 w-max max-w-[55vw] sm:max-w-80 bg-gray-800 text-white text-xs rounded-lg p-2.5 z-10 leading-relaxed shadow-lg'>
          {text}
        </span>
      )}
    </span>
  );
};
