import { Controller, Get } from "@nestjs/common"
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from "@nestjs/terminus"

@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // () => this.database.isHealthy("database"),
      // () => this.redis.isHealthy("redis"),
      // () => this.memory.checkHeap("memory"),
      () => this.memory.checkHeap("memory_heap", 150 * 1024 * 1024),
      // RSS should not exceed 300 MB
      () => this.memory.checkRSS("memory_rss", 300 * 1024 * 1024),
      // Storage should not exceed 90% usage
      () =>
        this.disk.checkStorage("storage", {
          path: process.cwd(),
          thresholdPercent: 0.9,
        }),
      () =>
        this.disk.checkStorage("disk", {
          path: process.cwd(),
          thresholdPercent: 0.9,
        }),
    ])
  }

  @Get("live")
  liveness() {
    return {
      status: "ok",
      info: {
        app: {
          status: "up",
        },
      },
    }
  }

  @Get("ready")
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.memory.checkHeap("memory_heap", 300 * 1024 * 1024),
    ])
  }
}
