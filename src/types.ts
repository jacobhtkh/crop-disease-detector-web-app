export type Prediction = { label: string; score: number };

export type Condition = { name: string; description: string };

export type Crop = { crop: string; conditions: Condition[] };

export type ImageResult = {
  filename: string;
  cropInImage?: string;
  predictions: Prediction[];
  previewUrl: string;
};
