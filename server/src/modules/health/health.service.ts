import { Injectable } from "@nestjs/common"
import { HealthResponse } from "./health.interface"

@Injectable()
export class HealthService {
  getHealth(): HealthResponse {
    return {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: process.env.npm_package_name ?? "nestjs-app",
      version: process.env.npm_package_version ?? "1.0.0",
    }
  }

  getLiveness() {
    return {
      status: "alive",
      timestamp: new Date().toISOString(),
    }
  }

  getReadiness() {
    return {
      status: "ready",
      timestamp: new Date().toISOString(),
    }
  }
}
