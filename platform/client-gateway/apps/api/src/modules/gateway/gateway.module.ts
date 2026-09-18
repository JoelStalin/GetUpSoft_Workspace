import { Module } from "@nestjs/common";
import { GatewayController } from "./gateway.controller";
import { GatewayStore } from "./gateway.store";

@Module({
  controllers: [GatewayController],
  providers: [GatewayStore]
})
export class GatewayModule {}
