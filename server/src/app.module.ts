import { ConfigModule } from "@nestjs/config"
import { Module } from "@nestjs/common"
import { AppService } from "@/app.service"
import { envConfig } from "@/configs/env.config"
import { RedisModule } from "@/redis/redis.module"
import { DatabaseModule } from "@/database/database.module"
import { AppController } from "@/app.controller"
import { HealthModule } from "@/modules/health/health.module"
import { AuthModule } from "@/modules/auth/auth.module"
import { AuthController } from "@/modules/auth/auth.controller"
import { UsersController } from "@/modules/users/users.controller"
import { UsersModule } from "@/modules/users/users.module"
import { OtpModule } from "@/modules/otp/otp.module"
import { HashingModule } from "@/modules/hashing/hashing.module"
import { JwtModule } from "@/modules/jwt/jwt.module"
import { TokenModule } from "@/modules/token/token.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    RedisModule,
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    OtpModule,
    HashingModule,
    JwtModule,
    TokenModule,
  ],
  controllers: [AppController, AuthController, UsersController],
  providers: [AppService],
})
export class AppModule {}
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(MorganMiddleware).forRoutes("*")
//   }
// }
