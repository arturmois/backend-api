# Troubleshooting Guide

This guide helps resolve common issues when setting up and running the Bens Seguros API.

## 🚨 Common Installation Issues

### Dependency Conflicts (ERESOLVE errors)

**Problem**: npm install fails with `ERESOLVE unable to resolve dependency tree`

**Solutions**:

1. **Use legacy peer deps (Recommended)**:
   ```bash
   npm install --legacy-peer-deps
   # or
   npm run install:legacy
   ```

2. **Force installation**:
   ```bash
   npm install --force
   # or
   npm run install:force
   ```

3. **Clean installation**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

4. **Use Yarn instead**:
   ```bash
   npm install -g yarn
   yarn install
   ```

### Node.js Version Issues

**Problem**: "engine" error or compatibility issues

**Solution**: Ensure you're using Node.js 18+ 
```bash
node --version  # Should be 18.x or higher
nvm install 18  # If using nvm
nvm use 18
```

## 🐳 Docker Issues

### Port Already in Use

**Problem**: `Error starting userland proxy: bind: address already in use`

**Solutions**:
1. **Stop conflicting services**:
   ```bash
   sudo lsof -i :3000  # Find what's using port 3000
   sudo kill -9 PID    # Kill the process
   ```

2. **Change ports in docker-compose.yml**:
   ```yaml
   ports:
     - "3001:3000"  # Use different host port
   ```

### Database Connection Issues

**Problem**: Database connection failures

**Solutions**:
1. **Ensure PostgreSQL is running**:
   ```bash
   docker-compose up postgres  # Start just postgres
   ```

2. **Check environment variables**:
   ```bash
   # Verify .env file has correct DATABASE_URL
   cat .env | grep DATABASE_URL
   ```

3. **Reset database**:
   ```bash
   docker-compose down -v  # Remove volumes
   docker-compose up postgres
   ```

## 🗄️ Database Issues

### Migration Failures

**Problem**: Database migrations fail

**Solutions**:
1. **Check database connection**:
   ```bash
   npm run db:migrate
   ```

2. **Reset migrations**:
   ```bash
   npm run db:rollback
   npm run db:migrate
   ```

3. **Manual database reset**:
   ```sql
   DROP DATABASE bens_seguros;
   CREATE DATABASE bens_seguros;
   ```

### Permission Errors

**Problem**: PostgreSQL permission denied

**Solutions**:
1. **Check PostgreSQL user permissions**:
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE bens_seguros TO postgres;
   ```

2. **Use correct credentials in .env**:
   ```env
   DB_USER=postgres
   DB_PASSWORD=postgres
   ```

## 🔧 TypeScript Issues

### Module Resolution Errors

**Problem**: Cannot find module '@/...' errors

**Solutions**:
1. **Rebuild TypeScript**:
   ```bash
   npm run build
   ```

2. **Check tsconfig.json paths**:
   ```json
   "baseUrl": "./src",
   "paths": {
     "@/*": ["*"]
   }
   ```

### Type Errors

**Problem**: TypeScript compilation errors

**Solutions**:
1. **Install type definitions**:
   ```bash
   npm install --save-dev @types/node @types/express
   ```

2. **Skip lib check temporarily**:
   ```json
   // tsconfig.json
   "skipLibCheck": true
   ```

## 🚀 Runtime Issues

### Port Binding Errors

**Problem**: EADDRINUSE errors

**Solutions**:
1. **Change port in .env**:
   ```env
   PORT=3001
   ```

2. **Kill existing processes**:
   ```bash
   pkill -f "node.*server"
   ```

### Memory Issues

**Problem**: JavaScript heap out of memory

**Solutions**:
1. **Increase Node.js memory**:
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run dev
   ```

2. **Use production build**:
   ```bash
   npm run build
   npm start
   ```

## 🔍 Testing Issues

### Test Database Issues

**Problem**: Tests fail due to database issues

**Solutions**:
1. **Create test database**:
   ```sql
   CREATE DATABASE bens_seguros_test;
   ```

2. **Update test environment**:
   ```env
   NODE_ENV=test
   TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bens_seguros_test
   ```

3. **Reset test database**:
   ```bash
   NODE_ENV=test npm run db:migrate
   ```

## 🌐 Network Issues

### API Not Accessible

**Problem**: Cannot reach API endpoints

**Solutions**:
1. **Check if server is running**:
   ```bash
   curl http://localhost:3000/health
   ```

2. **Verify firewall/network settings**:
   ```bash
   netstat -tlnp | grep 3000
   ```

3. **Check Docker network**:
   ```bash
   docker network ls
   docker network inspect bens-seguros_bens-seguros-network
   ```

## 📊 Monitoring Issues

### Prometheus Metrics Not Working

**Problem**: /metrics endpoint returns errors

**Solutions**:
1. **Enable metrics in .env**:
   ```env
   ENABLE_METRICS=true
   ```

2. **Check prom-client version**:
   ```bash
   npm list prom-client
   ```

### Grafana Dashboard Issues

**Problem**: Grafana shows no data

**Solutions**:
1. **Check Prometheus connection**:
   - Visit http://localhost:9090
   - Verify targets are up

2. **Restart services**:
   ```bash
   docker-compose restart prometheus grafana
   ```

## 🆘 Getting Help

If none of these solutions work:

1. **Check logs**:
   ```bash
   docker-compose logs api
   tail -f logs/combined.log
   ```

2. **Enable debug mode**:
   ```env
   LOG_LEVEL=debug
   NODE_ENV=development
   ```

3. **Create minimal reproduction**:
   ```bash
   git clone <repo>
   cd bens-seguros/api
   npm run setup
   docker-compose up
   ```

4. **Gather system information**:
   ```bash
   node --version
   npm --version
   docker --version
   docker-compose --version
   uname -a
   ```

## 📋 Quick Fixes Checklist

- [ ] Node.js 18+ installed
- [ ] Docker and Docker Compose running
- [ ] .env file created and configured
- [ ] PostgreSQL running and accessible
- [ ] No port conflicts (3000, 5432, 6379)
- [ ] Dependencies installed with --legacy-peer-deps
- [ ] Database migrations completed
- [ ] Correct file permissions on scripts

## 🔄 Reset Everything

If all else fails, complete reset:

```bash
# Stop all services
docker-compose down -v

# Clean npm
rm -rf node_modules package-lock.json

# Clean Docker
docker system prune -a --volumes

# Fresh start
npm install --legacy-peer-deps
docker-compose up --build
```