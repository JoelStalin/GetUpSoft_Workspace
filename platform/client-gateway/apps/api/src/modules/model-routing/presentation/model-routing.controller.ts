import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RouteCapabilityUseCase } from '../application/route-capability.use-case';

@ApiTags('model-routing')
@Controller('model-routing')
export class ModelRoutingController {
  constructor(private readonly routeCapability: RouteCapabilityUseCase) {}

  @Get('capabilities')
  @ApiOperation({ summary: 'Catalogo de capacidades y proveedores declarados' })
  capabilities() {
    return this.routeCapability.listCapabilities();
  }

  @Get('route')
  @ApiOperation({ summary: 'Decide que proveedor atiende una capacidad (reglas->local->externo gratuito->pendiente)' })
  route(@Query('capability') capability?: string) {
    if (!capability) throw new BadRequestException('falta el parametro capability');
    return this.routeCapability.execute(capability);
  }
}
