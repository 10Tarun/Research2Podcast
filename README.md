# Research2Podcast

Transform complex research papers into engaging, accessible audio podcast content using AI.

## Overview

Research2Podcast is a web platform that converts academic research papers (PDFs) into high-quality podcast audio. The platform uses advanced AI technologies to extract text from complex documents, generate conversational scripts, and synthesize natural-sounding narration.

## Features

- **Drag-and-Drop PDF Upload**: Easy file upload with validation and progress tracking
- **Intelligent PDF Parsing**: Extracts text from complex research papers using LlamaParse API
- **AI Script Generation**: Converts technical content into conversational, accessible podcast scripts using OpenAI GPT-4
- **Natural Audio Synthesis**: Creates high-quality narration with multiple voice options using ElevenLabs
- **Script Editing**: Preview and customize generated scripts before audio generation
- **Audio Player**: Built-in player with playback controls and download functionality
- **Conversion History**: Track all past conversions with metadata and audio URLs
- **User Authentication**: Secure authentication via Manus OAuth

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 19 + Tailwind CSS 4 + Vite |
| Backend | Express.js + Node.js + tRPC |
| Database | MySQL/TiDB |
| PDF Parsing | LlamaParse API |
| Script Generation | OpenAI GPT-4 |
| Text-to-Speech | ElevenLabs API |
| File Storage | AWS S3 |
| Authentication | Manus OAuth |

## Getting Started

### Prerequisites

- Node.js 22.13.0 or higher
- pnpm 10.4.1 or higher
- MySQL/TiDB database
- API keys for:
  - LlamaParse (PDF parsing)
  - OpenAI (script generation)
  - ElevenLabs (audio synthesis)

### Installation

1. **Clone the repository**
   ```bash
   cd /home/ubuntu/research-to-podcast
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up database**
   ```bash
   pnpm db:push
   ```

4. **Add API credentials** (see Configuration section)

5. **Start development server**
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:3000`

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL=mysql://user:password@host/database

# OAuth
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im

# External APIs (add when ready)
LLAMAPARSE_API_KEY=your_llamaparse_key
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key

# Other
JWT_SECRET=your_jwt_secret
```

### Adding API Keys

Once you have obtained API credentials:

1. **LlamaParse**: Get your API key from https://www.llamaindex.ai/
2. **OpenAI**: Get your API key from https://platform.openai.com/
3. **ElevenLabs**: Get your API key from https://elevenlabs.io/

Update the environment variables and restart the server.

## Project Structure

```
research-to-podcast/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # Utilities and hooks
│   │   └── App.tsx           # Main app component
│   └── public/               # Static assets
├── server/                    # Node.js backend
│   ├── routers.ts            # tRPC procedures
│   ├── db.ts                 # Database queries
│   ├── api-integrations.ts   # External API helpers
│   ├── conversion-procedures.ts  # Conversion pipeline
│   └── _core/                # Framework internals
├── drizzle/                  # Database schema and migrations
├── shared/                   # Shared types and constants
└── storage/                  # S3 storage helpers
```

## Usage

### For Users

1. **Upload**: Drag and drop a PDF research paper
2. **Review**: Wait for text extraction and script generation
3. **Edit**: Customize the generated podcast script if desired
4. **Select Voice**: Choose from available voice options
5. **Generate**: Create the audio podcast
6. **Download**: Download or listen to your podcast

### For Developers

#### Adding New Features

1. **Database changes**: Update `drizzle/schema.ts` and run `pnpm db:push`
2. **Backend logic**: Add procedures in `server/routers.ts`
3. **Frontend UI**: Create components in `client/src/components/` and pages in `client/src/pages/`
4. **Testing**: Write tests in `*.test.ts` files and run `pnpm test`

#### Running Tests

```bash
pnpm test                 # Run all tests
pnpm test -- --watch     # Watch mode
```

#### Building for Production

```bash
pnpm build               # Build frontend and backend
pnpm start              # Start production server
```

## API Procedures

### Papers

- `papers.list` - Get all papers for authenticated user
- `papers.getById` - Get specific paper details

### Conversions

- `conversions.create` - Create new conversion record
- `conversions.list` - Get all conversions for user
- `conversions.getById` - Get specific conversion details
- `conversions.updateScript` - Update generated script
- `conversions.updateStatus` - Update conversion status
- `conversions.uploadPaper` - Upload and validate PDF
- `conversions.parsePdf` - Extract text from PDF
- `conversions.generateScript` - Generate podcast script
- `conversions.synthesizeAudio` - Create audio narration
- `conversions.delete` - Delete conversion record

### Voices

- `voices.list` - Get all available voices

## Processing Pipeline

```
Upload PDF
    ↓
Validate File
    ↓
Extract Text (LlamaParse)
    ↓
Generate Script (OpenAI)
    ↓
User Reviews Script
    ↓
Synthesize Audio (ElevenLabs)
    ↓
Upload to S3
    ↓
Display for Download
```

## Error Handling

The platform includes comprehensive error handling at each stage:

- **Upload errors**: File validation failures, size limits
- **Parsing errors**: Corrupted PDFs, unsupported formats
- **Script generation errors**: API rate limits, content policy violations
- **Audio synthesis errors**: Voice unavailability, API timeouts

Failed conversions are marked with status "failed" and include error messages for debugging.

## Performance Considerations

- **Async Processing**: Long-running operations use background jobs with status polling
- **Caching**: Voice options are cached on the frontend
- **Pagination**: Conversion history uses pagination for large datasets
- **CDN Delivery**: Audio files served from S3 with CloudFront caching

## Security

- **Authentication**: All API procedures require Manus OAuth authentication
- **Authorization**: Users can only access their own papers and conversions
- **File Validation**: PDFs validated on upload (MIME type, size, content)
- **API Keys**: External credentials stored as environment variables, never exposed to frontend
- **Rate Limiting**: API procedures include rate limiting to prevent abuse

## Troubleshooting

### Development Server Issues

```bash
# Clear cache and restart
rm -rf .manus-logs
pnpm dev
```

### Database Connection Issues

```bash
# Check database URL
echo $DATABASE_URL

# Verify connection
pnpm db:push
```

### API Integration Issues

- Verify API keys are correctly set in environment variables
- Check API rate limits and quotas
- Review server logs in `.manus-logs/devserver.log`

## Future Enhancements

- Support for additional file formats (DOCX, EPUB)
- Batch processing of multiple papers
- Custom voice cloning with ElevenLabs
- Podcast feed generation for RSS distribution
- Collaborative features (sharing, commenting)
- Advanced analytics (listening time, engagement)
- Mobile app for iOS and Android

## Contributing

To contribute to Research2Podcast:

1. Create a feature branch
2. Make your changes
3. Write tests for new functionality
4. Run `pnpm test` to verify
5. Submit a pull request

## License

MIT

## Support

For issues, questions, or feature requests, please visit https://help.manus.im

## Changelog

### v1.0.0 (Initial Release)

- Core platform with PDF upload and conversion pipeline
- Integration with LlamaParse, OpenAI, and ElevenLabs
- User authentication and conversion history
- Audio player and download functionality
- Responsive web interface
