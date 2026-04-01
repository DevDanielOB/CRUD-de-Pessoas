import { Injectable } from '@nestjs/common';

type RouteMetric = {
  key: string;
  method: string;
  path: string;
  count: number;
  errors: number;
  totalDurationMs: number;
  avgDurationMs: number;
  lastStatusCode: number;
  lastRequestAt: string;
};

type RecentError = {
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  timestamp: string;
};

@Injectable()
export class TelemetryService {
  private readonly startedAt = new Date();
  private totalRequests = 0;
  private totalErrors = 0;
  private totalDurationMs = 0;
  private readonly routeMetrics = new Map<string, RouteMetric>();
  private readonly recentErrors: RecentError[] = [];

  recordRequest(method: string, path: string, statusCode: number, durationMs: number) {
    const key = `${method} ${path}`;
    const now = new Date().toISOString();
    const routeMetric = this.routeMetrics.get(key) ?? {
      key,
      method,
      path,
      count: 0,
      errors: 0,
      totalDurationMs: 0,
      avgDurationMs: 0,
      lastStatusCode: statusCode,
      lastRequestAt: now,
    };

    this.totalRequests += 1;
    this.totalDurationMs += durationMs;
    routeMetric.count += 1;
    routeMetric.totalDurationMs += durationMs;
    routeMetric.avgDurationMs = Number((routeMetric.totalDurationMs / routeMetric.count).toFixed(2));
    routeMetric.lastStatusCode = statusCode;
    routeMetric.lastRequestAt = now;

    if (statusCode >= 400) {
      this.totalErrors += 1;
      routeMetric.errors += 1;
      this.recentErrors.unshift({
        method,
        path,
        statusCode,
        durationMs,
        timestamp: now,
      });
      this.recentErrors.splice(10);
    }

    this.routeMetrics.set(key, routeMetric);
  }

  getSummary() {
    const uptimeSeconds = Math.floor((Date.now() - this.startedAt.getTime()) / 1000);
    const memoryUsage = process.memoryUsage();

    return {
      startedAt: this.startedAt.toISOString(),
      uptimeSeconds,
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      errorRate: this.totalRequests === 0 ? 0 : Number(((this.totalErrors / this.totalRequests) * 100).toFixed(2)),
      avgResponseTimeMs:
        this.totalRequests === 0 ? 0 : Number((this.totalDurationMs / this.totalRequests).toFixed(2)),
      memoryUsage: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
      },
    };
  }

  getDetailedMetrics() {
    const routes = [...this.routeMetrics.values()].sort((a, b) => b.count - a.count);

    return {
      ...this.getSummary(),
      routes,
      recentErrors: this.recentErrors,
    };
  }
}
