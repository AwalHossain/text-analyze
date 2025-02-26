# Text Harmony Analyzer

A sophisticated text analysis tool built with NestJS and React, featuring real-time text analysis, user authentication, and comprehensive reporting. This project implements a complete solution for analyzing texts with a focus on clean architecture, test-driven development, and modern web practices.

## 🔍 Project Overview

Text Analyzer provides a set of robust APIs to analyze text properties including word count, character count, sentence count, paragraph count, and longest words. The application implements user authentication via Google OAuth 2.0, ensuring only authorized users can access the analysis endpoints. All text analyses are stored in a database, allowing users to review their history.

## 🏗️ Architecture & Design Patterns

This project follows **Clean Architecture** principles with a clear separation of concerns:

- **Domain Layer**: Core business logic and entities
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: External systems, database, and frameworks
- **Presentation Layer**: Controllers and DTOs

The application implements several design patterns:
- **Repository Pattern**: For data access abstraction
- **Dependency Injection**: Enabled by NestJS for loose coupling
- **Strategy Pattern**: For different text analysis strategies
- **Factory Pattern**: For creating analysis services
- **Singleton Pattern**: For shared services

## 🌟 Why NestJS Over Express?

NestJS was chosen over plain Express.js for several key reasons:

1. **Structured Architecture**: NestJS enforces a modular structure that aligns with clean architecture principles
2. **TypeScript Integration**: First-class TypeScript support enables type safety and better IDE tooling
3. **Dependency Injection**: Built-in DI container simplifies testing and component management
4. **Decorators & Metadata**: Reduces boilerplate code and improves readability
5. **Middleware System**: Enhanced middleware capabilities with Guards, Interceptors, and Pipes
6. **Testing Utilities**: Comprehensive testing tools that align with TDD approach

While NestJS is built on top of Express.js (providing all Express capabilities), it adds a robust architectural framework that makes development more maintainable and testable.



## 🔒 Security & API Protection

### Authentication

The application implements Google OAuth 2.0 for authentication:
- Protected routes require a valid JWT token
- SSO integration simplifies user management
- JWT tokens are validated on every request

### Rate Limiting

All API endpoints implement intelligent rate limiting:

- **Per-User Rate Limiting**: 10 requests per minute per user (configurable)
- **Per-IP Rate Limiting**: Prevents abuse from unauthenticated requests
- **Method-Specific Limits**: Rate limits are applied per HTTP method (e.g., 10 POST requests)
- **Graceful Rejection**: Returns 429 Too Many Requests with clear error messages
- **Sliding Window**: Uses a sliding window approach to prevent bursts

Rate limiting helps protect the API from abuse while ensuring fair usage across all users.

## 🛠 Tech Stack

### Backend
- **NestJS**: Progressive Node.js framework built on Express.js
- **TypeScript**: For type safety and better developer experience
- **MongoDB**: NoSQL database for storing text analyses and user data
- **JWT**: For secure authentication
- **Cache Manager**: Redis-based caching to improve performance
- **Winston Logger**: Advanced logging with structured output

### Frontend
- **React**: For building the user interface
- **TypeScript**: For type-safe component development
- **TailwindCSS**: Utility-first CSS framework
- **Framer Motion**: For smooth animations and transitions
- **React Query**: For efficient data fetching and caching

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
```

**.env**

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/text-analyzer
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
THROTTLE_TTL=60000
THROTTLE_LIMIT=10
FRONTEND_URL=http://localhost:8080
API_URL=http://localhost:5000

# Test environment
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



## 🧪 Testing Approach

This project was developed using **Test-Driven Development (TDD)**:

1. **Write the test first**: Define the expected behavior
2. **Watch it fail**: Ensure the test fails correctly
3. **Implement the feature**: Write code to make the test pass
4. **Refactor**: Improve the code while keeping tests passing

### Running Tests Locally

```bash
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage report
npm run test:e2e       # Run end-to-end tests
```


## 🐳 Quick Start with Docker (Recommended for Examiners)

### Option 1: One-Click Setup (Easiest)

We've provided scripts that set up everything automatically:

```bash
Manual Docker Setup

# Navigate to the backend directory
cd backend

# Start the application
docker-compose up

# The API will be available at http://localhost:5000
# Swagger documentation at http://localhost:5000/api/docs
```

This will start the backend service with all configurations pre-set. The Docker setup includes:
- NestJS backend service with all dependencies
- Environment variables pre-configured
- Volume mapping for logs and code
- Health check endpoint

### Frontend Setup

1. Navigate to frontend directory

```bash
cd frontend
npm install
```

2. Create environment file

```bash
.env
```

**.env**

```bash
VITE_API_URL=http://localhost:5000/api
```

3. Start the frontend server

```bash
npm run dev
```

## 📚 API Documentation

Access the Swagger documentation at:

```
http://localhost:5000/api/docs
```

### Available Endpoints

- **POST** `/api/analyze/text` - Complete text analysis
- **POST** `/api/analyze/words` - Word count
- **POST** `/api/analyze/characters` - Character count
- **POST** `/api/analyze/sentences` - Sentence count
- **POST** `/api/analyze/paragraphs` - Paragraph count
- **POST** `/api/analyze/longestWord` - Longest words
- **GET** `/api/analyze/all` - Get user's analysis history

### Example Request

```json
{
  "content": "The quick brown fox jumps over the lazy dog. The lazy dog slept in the sun."
}
```

### Example Response (for /analyze/text)

```json
{
  "statusCode": 200,
  "message": "Text analyzed successfully",
  "data": {
    "wordCount": 16,
    "characterCount": 69,
    "sentenceCount": 2,
    "paragraphCount": 1,
    "longestWords": ["quick", "brown", "jumps"]
  }
}
```

## 💾 Caching Strategy

The application implements intelligent caching to improve performance:

- **Result Caching**: Analysis results are cached based on text content
- **User-Specific Cache**: Each user has their own cache namespace
- **TTL-Based Expiry**: Cache items expire after a configured time
- **Cache Invalidation**: Updates to text clear related caches

## 📊 Performance Enhancements

- Response caching implemented to prevent redundant processing
- Optimized text analysis algorithms 
- Database indexing for faster queries
- Real-time analysis with minimal latency
- Asynchronous processing for longer texts

## 📋 Problem Statement Implementation

This project fully addresses the original problem statement:

1. **Text CRUD Operations**: Create, read, update, and delete texts
2. **Database Integration**: MongoDB for storing text data
3. **Clean Architecture**: Properly layered with separation of concerns
4. **Text Analysis Features**:
   - Word count
   - Character count
   - Sentence count
   - Paragraph count
   - Longest word detection
5. **TDD Approach**: All components developed test-first with high coverage
6. **Required APIs**: All specified endpoints implemented
7. **Bonus Features**:
   - OAuth 2.0 authentication
   - API throttling with configurable limits
   - User-specific analysis reports
   - Caching to prevent redundancy

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details
