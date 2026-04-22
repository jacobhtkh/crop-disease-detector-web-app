const CROPS = [
  { crop: 'Corn', conditions: ['Common Rust', 'Gray Leaf Spot', 'Leaf Blight', 'Healthy'] },
  { crop: 'Potato', conditions: ['Early Blight', 'Late Blight', 'Healthy'] },
  { crop: 'Rice', conditions: ['Brown Spot', 'Leaf Blast', 'Healthy'] },
  { crop: 'Wheat', conditions: ['Brown Rust', 'Yellow Rust', 'Healthy'] },
];

export const SupportedCrops = () => (
  <>
    <p className='text-sm font-medium text-gray-700 mb-3'>
      Supported crops and conditions:
    </p>
    <ul className='space-y-3'>
      {CROPS.map(({ crop, conditions }) => (
        <li key={crop}>
          <p className='text-sm font-semibold text-gray-700 mb-1'>{crop}</p>
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
  </>
);
