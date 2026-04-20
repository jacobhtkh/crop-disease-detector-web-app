## About

This project is a frontend that utilises calls to an API with AI capabilities in order to estimate whether a crop image shows disease.

---

## Getting Started

### Prerequisites

- Node.js 18+
- The backend API running at `http://localhost:8000`

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
2. Click **Analyze Images** to send them to the API
3. Results show the top 5 predictions per image with confidence scores

**Supported crops:** Corn, Potato, Rice, Wheat

**Tip:** Including the crop name in the filename (e.g. `corn-field.jpg`) improves classification accuracy.

---

## Project Structure

```
src/
├── components/
│   ├── PreviewGrid.tsx   # Grid of selected image previews with remove buttons
│   ├── ResultCard.tsx    # Result card for a single image showing predictions
│   └── PredictionBar.tsx # Individual prediction label + confidence bar
├── types.ts              # Shared types (ImageResult, Prediction) and formatLabel
├── App.tsx               # Main app component with state and upload logic
└── main.tsx              # Entry point
```

---

## API

The app calls `POST http://localhost:8000/classify?top_k=5` with a `multipart/form-data` body.

**Request**

| Field   | Type            | Description               |
|---------|-----------------|---------------------------|
| `files` | `File[]`        | One or more image files   |
| `top_k` | query param int | Number of predictions (default 5) |

**Response**

```json
{
  "results": [
    {
      "filename": "corn-rust.jpg",
      "cropInImage": "corn",
      "predictions": [
        { "label": "Corn___Common_Rust", "score": 0.906 },
        { "label": "Wheat___Brown_Rust", "score": 0.066 }
      ]
    }
  ]
}
```
