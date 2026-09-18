import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly config: ConfigService) {
    super();
  }

  async onModuleInit(): Promise<void> {
    const mode = this.config.get<string>("GATEWAY_STORE_MODE") ?? "memory";
    const databaseUrl = this.config.get<string>("DATABASE_URL");
    if (mode !== "prisma" || !databaseUrl) {
      return;
    }
    await this.$connect();
  }
}
