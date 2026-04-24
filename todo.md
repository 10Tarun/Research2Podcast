# Research2Podcast - Development TODO

## Core Features

### Phase 1: Database & API Setup
- [x] Define database schema for papers, conversions, and audio metadata
- [ ] Set up LlamaParse API integration for PDF text extraction
- [ ] Set up OpenAI API integration for script generation
- [ ] Set up ElevenLabs API integration for text-to-speech
- [x] Create tRPC procedures for backend operations

### Phase 2: PDF Upload & Processing
- [x] Implement drag-and-drop PDF upload interface
- [x] Add file validation (PDF format, size limits)
- [ ] Create PDF parsing tRPC procedure with LlamaParse
- [ ] Store paper metadata in database
- [x] Display upload progress indicator

### Phase 3: Script Generation
- [ ] Create conversational script generation tRPC procedure
- [ ] Implement prompt engineering for podcast-style output
- [x] Add script preview UI component
- [x] Allow users to edit scripts before audio generation
- [x] Display script generation progress

### Phase 4: Audio Synthesis
- [x] Implement voice selection UI (multiple ElevenLabs voices)
- [ ] Create audio generation tRPC procedure
- [ ] Upload generated audio to S3 storage
- [x] Display audio synthesis progress
- [x] Store audio URL in database

### Phase 5: Audio Playback & History
- [x] Create audio player component with controls
- [x] Implement download functionality for generated podcasts
- [x] Build conversion history page
- [x] Display paper metadata and conversion details
- [ ] Add ability to delete conversions

### Phase 6: UI/UX Polish
- [x] Design clean, functional interface layout
- [x] Implement progress indicators for each stage
- [ ] Add error handling and user feedback
- [x] Create loading states and skeletons
- [x] Ensure responsive design

### Phase 7: Testing & Refinement
- [ ] Test with sample research papers
- [ ] Verify API integrations work correctly
- [ ] Test audio quality and voice options
- [ ] Refine error messages and user guidance
- [ ] Performance optimization

## Completed Implementation
- [x] Database schema with papers, conversions, and voices tables
- [x] tRPC procedures for all core operations
- [x] PDF upload zone component with drag-and-drop
- [x] Conversion progress indicator component
- [x] Script editor component with preview and editing
- [x] Audio player component with controls and download
- [x] Conversion history page
- [x] Home page with landing content and navigation
- [x] API integration helpers (LlamaParse, OpenAI, ElevenLabs)
- [x] Extended conversion procedures for full pipeline
- [x] Database tests (all passing)
- [x] Comprehensive README documentation

## Remaining Tasks
- [ ] Integrate LlamaParse API for actual PDF parsing
- [ ] Integrate OpenAI API for actual script generation
- [ ] Integrate ElevenLabs API for actual audio synthesis
- [ ] Implement file upload to server and S3
- [ ] Add delete conversion functionality
- [ ] Test with sample research papers
- [ ] Performance optimization and refinement
