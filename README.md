# RAG Frontend - Document Upload UI

A modern web application for uploading and managing documents in the RAG (Retrieval-Augmented Generation) system.

## Features

- ✅ Drag-and-drop file upload with validation
- ✅ Support for PDF, Word, Text, CSV, and Markdown files
- ✅ File size limit of 100MB
- ✅ Metadata input (title, category, tags, author, description)
- ✅ Real-time upload progress tracking
- ✅ Success/error feedback with detailed messages

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **File Handling**: react-dropzone
- **HTTP Client**: axios

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend server running at http://localhost:8000

## Installation

```bash
# Clone the repository
git clone https://github.com/kyanome/rag_frontend.git
cd rag_frontend

# Install dependencies
npm install

# Create environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

## Usage

1. Start the backend server:
   ```bash
   cd ../rag_backend
   make dev
   ```

2. Start the frontend development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 in your browser

4. Upload documents by:
   - Dragging and dropping files onto the upload area
   - Clicking to browse and select files
   - Filling in optional metadata
   - Clicking "Upload Document"

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Home page with upload form
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── upload/           # Upload-related components
│   │   ├── FileDropzone.tsx      # Drag-and-drop area
│   │   ├── FileUploadForm.tsx    # Main upload form
│   │   └── UploadProgress.tsx    # Progress indicator
│   └── layout/           # Layout components
│       └── Header.tsx    # App header with branding
├── lib/                   # Utilities
│   ├── api/              # API communication
│   │   └── documents.ts  # Document upload client
│   └── utils.ts          # Utility functions
└── types/                 # TypeScript definitions
    └── document.ts       # Document-related types
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## API Integration

The frontend communicates with the backend API at the endpoint configured in `NEXT_PUBLIC_API_URL`.

### Document Upload Endpoint

- **URL**: `POST /api/v1/documents/`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `file`: The document file (required)
  - `title`: Document title (optional)
  - `category`: Document category (optional)
  - `tags`: Comma-separated tags (optional)
  - `author`: Document author (optional)
  - `description`: Document description (optional)

## Troubleshooting

### CORS Errors

Ensure the backend server has CORS configured to allow requests from http://localhost:3000.

### Upload Failures

1. Verify the backend server is running
2. Check the API URL in `.env.local`
3. Ensure the file size is under 100MB
4. Confirm the file type is supported

### Database Errors

If you see database-related errors, ensure the backend has initialized its database:
```bash
cd ../rag_backend
make init-db
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Private project - All rights reserved