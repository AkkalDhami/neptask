import { Module, Global } from "@nestjs/common"
import { HashingService } from "./hashing.service"

export const HASHING_SERVICE = "HASHING_SERVICE" as const

@Global()
@Module({
  providers: [
    {
      provide: HASHING_SERVICE,
      useClass: HashingService,
    },
    HashingService,
  ],
  exports: [HASHING_SERVICE],
})
export class HashingModule {}

/*
? How to use:

* 1. Import HashingModule in AppModule.

?  Example:

  import { HashingModule } from "@/modules/hashing/hashing.module"

  @Module({
    imports: [
      HashingModule,
    ],
  })
  export class AppModule {}


* 2. Inject HASHING_SERVICE using @Inject()

?  Example:

  import { Inject } from "@nestjs/common"
  import type { IHashingService } from "@/modules/hashing/hashing.interface"
  import { HASHING_SERVICE } from "@/modules/hashing/hashing.module"

  constructor(
    @Inject(HASHING_SERVICE)
    private readonly hashingService: IHashingService,
  ) {}

* Hash password:
  const hashedPassword = await this.hashingService.hash(password);

* Verify password:
  const isValid = await this.hashingService.compare(
      password,
      hashedPassword,
    );
*/
