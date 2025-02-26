# Text Analyzer
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)




A sophisticated text analysis service built with Node.js that provides comprehensive text analytics capabilities including word count, character count, sentence analysis, and paragraph metrics. Built with enterprise-grade architecture, security, and scalability in mind.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technical Stack](#technical-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Security](#security)
- [Performance](#performance)
- [Contributing](#contributing)
- [License](#license)

## Overview

Text Analyzer is a robust REST API service that performs detailed analysis of text content. It follows Test-Driven Development (TDD) principles and implements clean architecture patterns to ensure maintainability and scalability.

## Key Features

- **Text Analysis Operations:**
  - Word count calculation
  - Character count analysis
  - Sentence detection and counting
  - Paragraph analysis
  - Longest word identification
- **Security Features:**
  - OAuth 2.0 authentication
  - API rate limiting
  - Role-based access control
- **Performance Optimizations:**
  - Response caching
  - Database query optimization
  - Efficient text processing algorithms
- **Developer Experience:**
  - Comprehensive API documentation
  - 100% test coverage
  - Docker support
  - Detailed logging

## Technical Stack

- **Runtime:** Node.js (v16+)
- **Language:** TypeScript
- **Framework:** NestJS
- **Database:** MongoDB (with Mongoose)
- **Caching:** Redis
- **Testing:** Jest
- **Documentation:** Swagger/OpenAPI
- **Authentication:** OAuth 2.0
- **Containerization:** Docker
- **Logging:** Winston

## Architecture

The application follows Clean Architecture principles with distinct layers:

```
src/
├── domain/          # Business entities and interfaces
├── application/     # Use cases and business logic
├── infrastructure/  # External services implementation
└── presentation/    # Controllers and DTOs
```

### Design Patterns Used

- Repository Pattern for data access
- Strategy Pattern for text analysis
- Factory Pattern for service creation
- Observer Pattern for logging
- Decorator Pattern for caching

## Getting Started

### Prerequisites

- Node.js v16 or higher
- MongoDB
- Redis (for caching)
- Docker and Docker Compose (optional)

### Local Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/text-analyzer.git
cd text-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Start the application:
```bash
npm run start:dev
```

### Docker Setup

1. Build and start containers:
```bash
docker-compose up -d
```

2. Access the application at `http://localhost:5000`

## API Documentation

### Core Endpoints

```typescript
POST /api/v1/analyze/words      // Get word count
POST /api/v1/analyze/chars      // Get character count
POST /api/v1/analyze/sentences  // Get sentence count
POST /api/v1/analyze/paragraphs // Get paragraph count
POST /api/v1/analyze/longest    // Get longest words
```

### Example Request

```json
{
  "text": "The quick brown fox jumps over the lazy dog. The lazy dog slept in the sun."
}
```

### Example Response

```json
{
  "wordCount": 16,
  "charCount": 70,
  "sentenceCount": 2,
  "paragraphCount": 1,
  "longestWord": "quick"
}
```

## Testing

The project follows TDD principles with 100% test coverage:

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Generate coverage report
npm run test:cov
```

### Test Coverage Requirements

- Unit tests for all business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Coverage report generation
- Continuous testing in CI/CD pipeline

## Security

- **Authentication:** 
  - OAuth 2.0 implementation
  - JWT token management
  - Role-based access control

- **Rate Limiting:** 
  - 100 requests per minute per user
  - Configurable through environment variables
  - IP-based and user-based throttling

- **Data Protection:**
  - Input sanitization
  - XSS protection
  - CORS configuration
  - Data validation

## Performance

### Caching Strategy

- Redis-based caching implementation
- Configurable TTL for cached results
- Cache invalidation on text updates
- Distributed caching support

### Database Optimization

- Indexed queries for faster lookups
- Connection pooling
- Query optimization
- Efficient data structures

### Monitoring

- Winston logging integration
- Performance metrics tracking
- Error tracking and reporting
- Resource usage monitoring

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 