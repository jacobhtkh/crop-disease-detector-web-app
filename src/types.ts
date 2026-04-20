export type Prediction = { label: string; score: number };

export type ImageResult = {
  filename: string;
  cropInImage?: string;
  predictions: Prediction[];
  previewUrl: string;
};

export function formatLabel(label: string) {
  return label.replace(/___/g, ' — ').replace(/_/g, ' ');
}
