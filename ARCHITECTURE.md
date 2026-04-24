# Research2Podcast - Technical Architecture

## System Overview

The Research2Podcast platform transforms complex academic research papers into engaging audio podcast content through a multi-stage pipeline. The architecture leverages modern web technologies, AI APIs, and cloud storage to provide a seamless user experience.

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | React 19 + Tailwind CSS 4 | User interface and interactions |
| **Backend** | Express.js + Node.js | API server and business logic |
| **Database** | MySQL/TiDB | Store papers, conversions, and metadata |
| **API Layer** | tRPC | Type-safe RPC between frontend and backend |
| **PDF Parsing** | LlamaParse API | Extract text from complex research papers |
| **Script Generation** | OpenAI GPT-4 | Convert research content to conversational scripts |
| **Text-to-Speech** | ElevenLabs API | Generate natural-sounding podcast audio |
| **File Storage** | AWS S3 | Store generated audio files |
| **Authentication** | Manus OAuth | User authentication and session management |

## Data Flow Architecture

```
User Upload
    ↓
PDF Validation & Storage
    ↓
LlamaParse Text Extraction
    ↓
OpenAI Script Generation (Conversational)
    ↓
User Script Review & Edit
    ↓
ElevenLabs Audio Synthesis
    ↓
S3 Upload & Metadata Storage
    ↓
Audio Playback & Download
```

## Database Schema

### papers table
Stores information about uploaded research papers.

| Field | Type | Purpose |
|-------|------|---------|
| id | int | Primary key |
| userId | int | Foreign key to users table |
| title | varchar | Paper title (extracted or user-provided) |
| fileName | varchar | Original PDF filename |
| fileSize | int | File size in bytes |
| uploadedAt | timestamp | Upload timestamp |
| createdAt | timestamp | Record creation time |

### conversions table
Tracks each paper-to-podcast conversion with processing status.

| Field | Type | Purpose |
|-------|------|---------|
| id | int | Primary key |
| paperId | int | Foreign key to papers table |
| userId | int | Foreign key to users table |
| rawText | longtext | Extracted text from PDF |
| script | longtext | Generated podcast script |
| selectedVoice | varchar | ElevenLabs voice ID |
| audioUrl | varchar | S3 URL to generated audio |
| status | enum | Processing stage (uploaded, parsing, scripting, synthesizing, completed, failed) |
| errorMessage | text | Error details if failed |
| createdAt | timestamp | Conversion start time |
| completedAt | timestamp | Conversion completion time |

### voices table
Available ElevenLabs voice options.

| Field | Type | Purpose |
|-------|------|---------|
| id | int | Primary key |
| voiceId | varchar | ElevenLabs voice ID |
| voiceName | varchar | Display name |
| gender | varchar | Voice gender |
| accent | varchar | Voice accent/language |
| description | text | Voice characteristics |

## API Procedures (tRPC)

### papers.upload
- **Type:** Protected mutation
- **Input:** PDF file (multipart)
- **Output:** Paper ID, upload status
- **Process:** Validate file, store metadata, initiate parsing

### papers.list
- **Type:** Protected query
- **Output:** Array of user's papers with metadata
- **Process:** Fetch papers for authenticated user

### conversions.create
- **Type:** Protected mutation
- **Input:** Paper ID
- **Output:** Conversion ID, initial status
- **Process:** Create conversion record, trigger LlamaParse

### conversions.getStatus
- **Type:** Protected query
- **Input:** Conversion ID
- **Output:** Current status, progress, error details
- **Process:** Poll conversion status

### conversions.generateScript
- **Type:** Protected mutation
- **Input:** Conversion ID, extracted text
- **Output:** Generated script
- **Process:** Call OpenAI to create conversational script

### conversions.updateScript
- **Type:** Protected mutation
- **Input:** Conversion ID, edited script
- **Output:** Updated script
- **Process:** Save user edits to database

### conversions.synthesizeAudio
- **Type:** Protected mutation
- **Input:** Conversion ID, script, voice ID
- **Output:** Audio URL, synthesis status
- **Process:** Call ElevenLabs, upload to S3, store URL

### conversions.getHistory
- **Type:** Protected query
- **Output:** Array of user's conversions with metadata
- **Process:** Fetch completed conversions with audio URLs

### voices.list
- **Type:** Public query
- **Output:** Array of available voices
- **Process:** Return cached voice options

## Processing Pipeline

### Stage 1: PDF Upload & Validation
The user uploads a PDF file through the drag-and-drop interface. The frontend validates the file format and size before sending to the backend. The backend stores the file temporarily and creates a paper record in the database.

### Stage 2: Text Extraction (LlamaParse)
The backend calls the LlamaParse API with the PDF content. LlamaParse handles complex layouts, tables, figures, and equations, returning clean Markdown text. This text is stored in the conversions table for later use.

### Stage 3: Script Generation (OpenAI)
The backend sends the extracted text to OpenAI GPT-4 with a specialized prompt that instructs the model to create a conversational, podcast-style script. The prompt emphasizes making technical content accessible to a general audience while preserving key insights.

### Stage 4: Script Review (Optional)
The user can preview and edit the generated script in the UI before proceeding to audio synthesis. This allows for customization and quality control.

### Stage 5: Audio Synthesis (ElevenLabs)
The backend sends the script and selected voice to ElevenLabs' text-to-speech API. ElevenLabs generates high-quality audio with natural prosody and emotional nuance.

### Stage 6: Storage & Delivery
The generated audio is uploaded to AWS S3 with a unique key. The S3 URL is stored in the database, and the user can play, download, or share the podcast.

## Error Handling & Retry Logic

Each stage includes error handling with user-friendly messages:

- **Upload errors:** File validation failures, size limits
- **Parsing errors:** Corrupted PDFs, unsupported formats
- **Script generation errors:** API rate limits, content policy violations
- **Audio synthesis errors:** Voice unavailability, API timeouts

Failed conversions are marked with status "failed" and include error messages. Users can retry failed conversions.

## Security Considerations

- **Authentication:** All API procedures require user authentication via Manus OAuth
- **Authorization:** Users can only access their own papers and conversions
- **File Validation:** PDF files are validated on upload (MIME type, size, content)
- **API Keys:** External API keys (LlamaParse, OpenAI, ElevenLabs) are stored as environment variables and never exposed to the frontend
- **S3 Access:** Audio files are stored in a private S3 bucket with presigned URLs for download
- **Rate Limiting:** Implement rate limiting on API procedures to prevent abuse

## Performance Optimizations

- **Async Processing:** Long-running operations (parsing, script generation, audio synthesis) are handled asynchronously with status polling
- **Caching:** Voice options are cached on the frontend
- **Lazy Loading:** Conversion history uses pagination to avoid loading all records at once
- **CDN Delivery:** Audio files are served from S3 with CloudFront caching for fast downloads

## Scalability Considerations

- **Database:** Use connection pooling to handle concurrent requests
- **API Rate Limits:** Implement queue system for processing multiple conversions
- **Storage:** S3 automatically scales for file storage
- **Monitoring:** Log all API calls and errors for debugging and optimization

## Future Enhancements

- Support for additional file formats (DOCX, EPUB)
- Batch processing of multiple papers
- Custom voice cloning with ElevenLabs
- Podcast feed generation for RSS distribution
- Collaborative features (sharing, commenting)
- Advanced analytics (listening time, user engagement)
