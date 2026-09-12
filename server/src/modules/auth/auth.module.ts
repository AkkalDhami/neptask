import { Module } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { UsersModule } from "@/modules/users/users.module"
import { OtpModule } from "@/modules/otp/otp.module"

@Module({
  imports: [UsersModule, OtpModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
