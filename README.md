# Bens Seguros API

A comprehensive backend API built with modern best practices, featuring Docker containerization, multi-cloud deployment support, automated testing, advanced SQL modeling, comprehensive error handling, API documentation, and full observability.

## 🚀 Features

- **🏗️ Modern Architecture**: Built with Node.js, TypeScript, and Express
- **🐳 Docker Support**: Multi-stage builds with development and production configurations
- **☁️ Multi-Cloud Deployment**: Ready-to-deploy configurations for AWS, Azure, and GCP
- **🧪 Comprehensive Testing**: Unit tests, integration tests, and automated CI/CD
- **🗄️ Advanced Database**: PostgreSQL with Knex.js for migrations and query building
- **📚 API Documentation**: Auto-generated OpenAPI/Swagger documentation
- **🛡️ Security**: JWT authentication, rate limiting, input validation, and security headers
- **📊 Observability**: Logging, metrics, health checks, and monitoring dashboards
- **🔄 CI/CD**: GitHub Actions with automated testing and deployment
- **⚡ Performance**: Redis caching, connection pooling, and optimized queries

## 📋 Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 15+
- Redis 7+

For cloud deployment:
- AWS CLI and appropriate IAM permissions
- Azure CLI and subscription access
- Google Cloud CLI and project permissions

## 🛠️ Installation

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd bens-seguros/api

# Install dependencies (use legacy peer deps to resolve conflicts)
npm install --legacy-peer-deps
# or use the setup script
npm run setup

# Copy environment configuration
cp env.example .env

# Edit .env file with your configuration
nano .env

# Start infrastructure services
docker-compose up -d postgres redis

# Run database migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed

# Start development server
npm run dev
```

### Docker Development

```bash
# Start all services with Docker
docker-compose up

# The API will be available at http://localhost:3000
# API documentation at http://localhost:3000/api-docs
# Grafana dashboard at http://localhost:3001 (admin/admin)
# Prometheus at http://localhost:9090
```

## 🏃‍♂️ Quick Start

### Demo Accounts

The seed data includes demo accounts:

- **Admin**: `admin@bensseguros.com` / `admin123!@#`
- **Agent**: `agent@bensseguros.com` / `admin123!@#`
- **User**: `user@bensseguros.com` / `admin123!@#`

### API Endpoints

- **Health Check**: `GET /health`
- **API Documentation**: `GET /api-docs`
- **Authentication**: `POST /api/v1/auth/login`
- **User Registration**: `POST /api/v1/auth/register`
- **User Profile**: `GET /api/v1/auth/me`

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run all tests
npm run test:all
```

## 📊 Database Schema

The API includes comprehensive database models for an insurance domain:

- **Users**: Customer and agent management
- **Policy Types**: Insurance product definitions
- **Policies**: Active insurance policies
- **Claims**: Insurance claim processing
- **Payments**: Financial transactions
- **Audit Logs**: Complete audit trail

### Running Migrations

```bash
# Run latest migrations
npm run db:migrate

# Rollback migrations
npm run db:rollback

# Create new migration
npx knex migrate:make migration_name
```

## 🐳 Docker

### Development

```bash
# Start development environment
docker-compose up

# Build development image
docker-compose build api
```

### Production

```bash
# Build production image
docker build --target production -t bens-seguros-api .

# Run production container
docker run -p 3000:3000 bens-seguros-api
```

## ☁️ Cloud Deployment

### AWS Deployment

```bash
# Deploy with CloudFormation
aws cloudformation create-stack \
  --stack-name bens-seguros-api \
  --template-body file://deployment/aws/cloudformation.yml \
  --parameters ParameterKey=DatabasePassword,ParameterValue=YourPassword123

# Deploy with ECS
aws ecs register-task-definition \
  --cli-input-json file://deployment/aws/ecs-task-definition.json
```

### Azure Deployment

```bash
# Deploy with ARM templates
az deployment group create \
  --resource-group bens-seguros \
  --template-file deployment/azure/app-service.yml \
  --parameters databaseUrl="connection-string" jwtSecret="secret"
```

### GCP Deployment

```bash
# Deploy to Cloud Run
gcloud run deploy bens-seguros-api \
  --image gcr.io/project-id/bens-seguros-api:latest \
  --platform managed \
  --region us-central1
```

### Terraform (Multi-Cloud)

```bash
# Initialize Terraform
cd deployment/terraform
terraform init

# Plan deployment
terraform plan -var="cloud_provider=aws" -var="database_password=secure123"

# Deploy infrastructure
terraform apply
```

## 🛡️ Security

### Authentication

The API uses JWT-based authentication with:
- Access tokens (24h expiry)
- Refresh tokens (7d expiry)
- Role-based access control (RBAC)
- Permission-based authorization

### Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Joi-based request validation
- **Security Headers**: Helmet.js for security headers
- **SQL Injection Protection**: Parameterized queries with Knex.js
- **CORS**: Configurable cross-origin resource sharing
- **Password Security**: bcrypt with 12 rounds

## 📊 Monitoring & Observability

### Health Checks

- `GET /health` - Basic health status
- `GET /health/detailed` - Database and system health
- `GET /health/ready` - Kubernetes readiness probe
- `GET /health/live` - Kubernetes liveness probe

### Metrics

Prometheus metrics available at `/metrics`:
- HTTP request duration and count
- Database connection pool metrics
- Custom business metrics
- System resource usage

### Logging

Structured logging with Winston:
- JSON format in production
- Colorized console in development
- Log levels: error, warn, info, http, debug
- Request correlation IDs

### Dashboards

Grafana dashboards included:
- API performance metrics
- Database performance
- System resource usage
- Business metrics

## 🔄 CI/CD Pipeline

GitHub Actions workflow includes:

1. **Code Quality**: ESLint, security audit, Snyk scanning
2. **Testing**: Unit tests, integration tests, coverage reporting
3. **Security**: Trivy container scanning, SARIF reporting
4. **Build & Push**: Multi-platform Docker builds
5. **Deployment**: Automated staging and production deployments
6. **Monitoring**: Smoke tests and performance testing

## 📝 API Documentation

Interactive API documentation is available at `/api-docs` when running the server.

The documentation includes:
- Complete endpoint reference
- Request/response schemas
- Authentication requirements
- Error response formats
- Interactive testing interface

## 🐛 Error Handling

Comprehensive error handling with:
- Custom error classes
- Structured error responses
- Request correlation IDs
- Validation error details
- Security-aware error messages

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "statusCode": 400,
    "code": "VALIDATION_ERROR",
    "details": {
      "errors": [
        {
          "field": "email",
          "message": "Please provide a valid email address"
        }
      ]
    },
    "requestId": "req_123456789",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/api/v1/auth/register"
  }
}
```

## 🚦 Environment Variables

Key environment variables:

```bash
# Server
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Authentication
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=24h

# Redis
REDIS_URL=redis://localhost:6379

# Monitoring
ENABLE_METRICS=true
LOG_LEVEL=info
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Update documentation
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [Troubleshooting Guide](TROUBLESHOOTING.md) for common issues
- Create an issue on GitHub
- Check the API documentation at `/api-docs`
- Review the health check endpoints for system status

### Common Installation Issues

If you encounter dependency conflicts during installation:

```bash
# Try these solutions in order:
npm install --legacy-peer-deps
# or
npm install --force
# or
npm run setup
```

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions.

## 🗺️ Roadmap

- [ ] Real-time notifications with WebSockets
- [ ] Advanced analytics and reporting
- [ ] Mobile SDK development
- [ ] Machine learning integration for fraud detection
- [ ] Multi-tenant architecture
- [ ] GraphQL API support