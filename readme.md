# Text Harmony Analyzer

A sophisticated text analysis tool built with NestJS and React, featuring real-time text analysis, user authentication, and comprehensive reporting.

## 🌟 Features

- **Text Analysis**
  - Word count
  - Character count
  - Sentence count
  - Paragraph count
  - Longest word detection
- **User Authentication**
  - Google OAuth 2.0
  - JWT-based authentication
- **Performance**
  - API throttling
  - Response caching
  - Real-time analysis
- **Security**
  - Protected routes
  - Rate limiting
  - CORS enabled

## 🛠 Tech Stack

### Backend
- NestJS
- TypeScript
- MongoDB
- JWT
- Cache Manager
- Winston Logger

### Frontend
- React
- TypeScript
- TailwindCSS
- Framer Motion
- React Query

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Google OAuth credentials
- npm or yarn

## 🚀 Getting Started

### Backend Setup

1. Clone the repository

```bash
git clone <repository-url>
cd text-analyzer
```

2. Install dependencies


```bash
cd backend
npm install
```

3. Create environment file

```bash
.env
.env.test
```

**.env**

```bash
PORT=3000
MONGODB_URI=mongodb://localhost:27017/text-analyzer
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
THROTTLE_TTL=60000
THROTTLE_LIMIT=10


MONGODB_TEST_URI=mongodb://localhost:27017/text-analyzer-test
TEST_JWT_SECRET=test-secret
TEST_GOOGLE_CLIENT_ID=mock-client-id
TEST_GOOGLE_CLIENT_SECRET=mock-client-secret
TEST_THROTTLE_TTL=60000
TEST_THROTTLE_LIMIT=5
```


4. Start the backend server

```bash
npm run start:dev
```
### Frontend Setup

1. Navigate to frontend directory

```bash
cd frontend
npm start
```

2. Create environment file

```bash
.env
```

**.env**

```bash
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret
```

3. Start the frontend server

```bash
npm run dev
```



## 🧪 Testing

### Running Backend Tests

- Unit tests

```bash
npm run test
```

- E2E tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:coverage
```


## 📚 API Documentation

Access the Swagger documentation at:

```bash
http://localhost:3000/api/docs
```



### Available Endpoints

- POST `/api/analyze/text` - Complete text analysis
- POST `/api/analyze/words` - Word count
- POST `/api/analyze/characters` - Character count
- POST `/api/analyze/sentences` - Sentence count
- POST `/api/analyze/paragraphs` - Paragraph count
- POST `/api/analyze/longestWord` - Longest words
- GET `/api/analyze/all` - Get user's analysis history

## 🔒 Authentication

The application uses Google OAuth 2.0 for authentication. Protected routes require a valid JWT token.

## 🚦 Rate Limiting

- 10 requests per minute per user
- Applies to all analysis endpoints

## 📈 Performance

- Response caching implemented
- Optimized text analysis algorithms
- Real-time analysis with minimal latency

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details



