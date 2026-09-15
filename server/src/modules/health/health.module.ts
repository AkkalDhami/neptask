import { Module } from "@nestjs/common"
import { TerminusModule } from "@nestjs/terminus"
import { HealthController } from "./health.controller"
import { LoggerModule } from "@/shared/logger/logger.module"

@Module({
  imports: [TerminusModule, LoggerModule],
  controllers: [HealthController],
  providers: [],
})
export class HealthModule {}
