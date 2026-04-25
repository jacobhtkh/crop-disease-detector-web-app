## About

This project is a frontend that utilises calls to a FastAPU backend with AI capabilities in order to estimate whether provided crop images show disease.

Deployed at: https://crop-disease-detector-web-app-delta.vercel.app

### Supported crops and diseases

| Crop   | Disease / Label |
| ------ | --------------- |
| Corn   | Common Rust     |
| Corn   | Gray Leaf Spot  |
| Corn   | Healthy         |
| Corn   | Leaf Blight     |
| Potato | Early Blight    |
| Potato | Healthy         |
| Potato | Late Blight     |
| Rice   | Brown Spot      |
| Rice   | Healthy         |
| Rice   | Leaf Blast      |
| Wheat  | Brown Rust      |
| Wheat  | Healthy         |
| Wheat  | Yellow Rust     |

As you can see it's mostly leaf diseases covered.

Images that do not match a supported crop return an `Invalid` label.

---

## Getting Started

### Prerequisites

- Node.js 18+
- The backend API running at `http://localhost:8000` locally

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Usage

1. Click **Choose Files** and select up to 6 crop images
2. For each image, optionally select a crop from the dropdown — or leave it on **Get crop name from filename** to detect it automatically
3. Click **Analyse Images** to send them to the API
4. Results show the top 5 predictions per image with confidence scores

**Supported crops:** Corn, Potato, Rice, Wheat

**Tip:** When using automatic detection, include the crop name in the filename (e.g. `corn-field.jpg`) so the API can identify the crop correctly.

---

## Project Structure

```
src/
├── components/
│   ├── InfoTooltip.tsx   # Reusable hover tooltip icon
│   ├── PreviewGrid.tsx   # Grid of selected image previews with remove buttons
│   ├── PredictionBar.tsx # Individual prediction label + confidence bar
│   ├── ResultCard.tsx    # Result card for a single image showing predictions
│   ├── SupportedCrops.tsx # List of supported crops and conditions shown on load
│   └── index.ts          # Re-exports all components
├── types.ts              # Shared types (ImageResult, Prediction, Crop) and formatLabel
├── App.tsx               # Main app component with state and upload logic
└── main.tsx              # Entry point
```

---

## API

The app makes two API calls, both to the base URL defined by the `VITE_CROP_DISEASE_DETECTOR_API_URL` environment variable.

### `GET /supported-crops`

Called on mount to populate the supported crops list shown before analysis.

**Response**

```json
{
  "crops": [
    {
      "crop": "Corn",
      "conditions": [
        {
          "name": "Common Rust",
          "description": "Caused by Puccinia sorghi, producing brick-red pustules on both leaf surfaces. Spores spread northward via wind each summer and are favoured by cool, humid conditions."
        },
        {
          "name": "Gray Leaf Spot",
          "description": "Caused by Cercospora zeae-maydis, producing rectangular gray-brown lesions that run parallel between leaf veins. Thrives in warm, humid conditions and overwinters in corn debris."
        },
        {
          "name": "Leaf Blight",
          "description": "Northern Leaf Blight, caused by Exserohilum turcicum, produces long elliptical gray-green lesions on leaves that turn tan. Severe infections can reduce grain yields by 40–70%."
        },
        {
          "name": "Healthy",
          "description": "Crop shows no signs of disease or infection."
        }
      ]
    },
    {
      "crop": "Potato",
      "conditions": [
        {
          "name": "Early Blight",
          "description": "Caused by Alternaria solani, producing dark circular lesions with a concentric ring (target-like) pattern on older, lower leaves. Favoured by alternating wet and dry periods."
        },
        {
          "name": "Late Blight",
          "description": "Caused by Phytophthora infestans, rapidly spreading dark blotches on leaves and stems that collapse quickly. Historically responsible for the 1845 Irish Potato Famine."
        },
        {
          "name": "Healthy",
          "description": "Crop shows no signs of disease or infection."
        }
      ]
    },
    {
      "crop": "Rice",
      "conditions": [
        {
          "name": "Brown Spot",
          "description": "Caused by Cochliobolus miyabeanus, producing oval brown spots with grey centres on leaves. Common in nutrient-deficient soils; can cause up to 45% yield loss."
        },
        {
          "name": "Leaf Blast",
          "description": "Caused by Magnaporthe oryzae, producing spindle-shaped whitish-gray lesions with brown borders on leaves. One of the most destructive rice diseases, responsible for 10–30% global yield loss."
        },
        {
          "name": "Healthy",
          "description": "Crop shows no signs of disease or infection."
        }
      ]
    },
    {
      "crop": "Wheat",
      "conditions": [
        {
          "name": "Brown Rust",
          "description": "Caused by Puccinia triticina, producing small round orange-brown pustules scattered across leaf surfaces. Wind-dispersed; high humidity and mild temperatures favour spread."
        },
        {
          "name": "Yellow Rust",
          "description": "Caused by Puccinia striiformis, producing yellow-orange spores arranged in stripes along leaves. A cool-season disease where yield losses can exceed 70% in severe epidemics."
        },
        {
          "name": "Healthy",
          "description": "Crop shows no signs of disease or infection."
        }
      ]
    }
  ]
}
```

### `POST /classify?top_k=5`

Called when the user submits images for analysis. Accepts a `multipart/form-data` body.

**Request**

| Field   | Type            | Description                       |
| ------- | --------------- | --------------------------------- |
| `files` | `File[]`        | One or more image files           |
| `top_k` | query param int | Number of predictions (default 5) |

**Response**

```json
{
  "results": [
    {
      "filename": "green-wheat.jpeg",
      "cropInImage": "wheat",
      "predictions": [
        {
          "label": "Wheat___Healthy",
          "score": 0.9750185012817383
        },
        {
          "label": "Wheat___Yellow_Rust",
          "score": 0.005910073406994343
        }
      ]
    }
  ]
}
```
