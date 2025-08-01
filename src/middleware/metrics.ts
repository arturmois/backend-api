import { Request, Response, NextFunction } from 'express';
import { register, Counter, Histogram, Gauge } from 'prom-client';

// HTTP request metrics
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

// System metrics
const activeConnections = new Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections',
});

const nodeMemoryUsage = new Gauge({
  name: 'nodejs_memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type'],
});

const nodeUptime = new Gauge({
  name: 'nodejs_uptime_seconds',
  help: 'Node.js uptime in seconds',
});

// Update system metrics periodically
const updateSystemMetrics = () => {
  const memoryUsage = process.memoryUsage();
  nodeMemoryUsage.set({ type: 'rss' }, memoryUsage.rss);
  nodeMemoryUsage.set({ type: 'heapUsed' }, memoryUsage.heapUsed);
  nodeMemoryUsage.set({ type: 'heapTotal' }, memoryUsage.heapTotal);
  nodeMemoryUsage.set({ type: 'external' }, memoryUsage.external);
  
  nodeUptime.set(process.uptime());
};

// Update system metrics every 10 seconds
setInterval(updateSystemMetrics, 10000);

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Skip metrics collection for the metrics endpoint itself
  if (req.path === '/metrics') {
    return next();
  }

  const startTime = Date.now();
  activeConnections.inc();

  // Override res.end to capture metrics when response is sent
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any): Response<any, Record<string, any>> {
    const duration = (Date.now() - startTime) / 1000;
    const route = req.route?.path || req.path;
    const method = req.method;
    const statusCode = res.statusCode.toString();

    // Record metrics
    httpRequestsTotal.inc({ method, route, status_code: statusCode });
    httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
    activeConnections.dec();

    // Call original end method
    originalEnd.call(this, chunk, encoding);
    return res;
  };

  next();
};

export const metricsEndpoint = (req: Request, res: Response): void => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
};

export { register };
export default metricsMiddleware;