src/
│
├── app.module.ts
├── main.ts
│
├── configs/
│   ├── configuration.ts
│   ├── env.validation.ts
│   └── index.ts
│
├── database/
│   ├── drizzle.module.ts
│   ├── drizzle.service.ts
│   ├── drizzle.config.ts
│   ├── migrations/
│   └── schema/
│       ├── users.ts
│       ├── refresh-tokens.ts
│       └── index.ts
│
├── redis/
│   ├── redis.module.ts
│   ├── redis.service.ts
│   └── redis.provider.ts
│
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   ├── pipes/
│   ├── constants/
│   ├── interfaces/
│   └── utils/
│
├── modules/
│   │
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   │
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── refresh.dto.ts
│   │   │
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── refresh.guard.ts
│   │   │   └── roles.guard.ts
│   │   │
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── refresh.strategy.ts
│   │   │
│   │   └── interfaces/
│   │
│   └── users/
│       ├── users.module.ts
│       ├── users.controller.ts
│       ├── users.service.ts
│       ├── users.repository.ts
│       └── dto/
│
├── types/
│
└── shared/
    ├── logger/
    ├── mail/
    └── cache/
