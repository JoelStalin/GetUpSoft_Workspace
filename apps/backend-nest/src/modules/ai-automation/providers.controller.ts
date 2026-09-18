import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrcaApiKeyGuard } from '../../common/guards/orca-api-key.guard';
import { ProviderConfigRequestDto, ProviderTestRequestDto, ProviderValidationRequestDto } from './dto/providers.dto';
import { ProvidersService } from './providers.service';

@ApiTags('ai-automation providers')
@ApiHeader({ name: 'api-key', required: true })
@UseGuards(OrcaApiKeyGuard)
@Controller('api/providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  @ApiOperation({ summary: 'List available AI providers' })
  listProviders() {
    return this.providersService.listProviders();
  }

  @Get('status')
  @ApiOperation({ summary: 'Get provider configuration status' })
  providerStatus(@Query('user_id') userId = 'default') {
    return this.providersService.providerStatus(userId);
  }

  @Get('config/:providerId')
  @ApiOperation({ summary: 'Get provider configuration status for current user' })
  getProviderConfig(@Param('providerId') providerId: string, @Query('user_id') userId = 'default') {
    return this.providersService.getProviderConfig(providerId, userId);
  }

  @Post('config')
  @ApiOperation({ summary: 'Save provider configuration' })
  saveProviderConfig(@Body() request: ProviderConfigRequestDto) {
    return this.providersService.saveProviderConfig(request);
  }

  @Post('test')
  @ApiOperation({ summary: 'Test provider configuration presence' })
  testProvider(@Body() request: ProviderTestRequestDto, @Query('user_id') userId = 'default') {
    return this.providersService.testProvider(request.provider_id, userId);
  }

  @Get(':provider')
  @ApiOperation({ summary: 'Get details for a specific provider' })
  getProvider(@Param('provider') provider: string) {
    return this.providersService.getProvider(provider);
  }

  @Post(':provider/validate')
  @ApiOperation({ summary: 'Validate provider credential shape without leaking secrets' })
  validateProvider(@Param('provider') provider: string, @Body() request: ProviderValidationRequestDto) {
    return this.providersService.validateProvider(provider, request);
  }

  @Post(':provider/connect')
  @ApiOperation({ summary: 'Connect provider for a user' })
  connectProvider(
    @Param('provider') provider: string,
    @Body() request: ProviderValidationRequestDto,
    @Query('user_id') userId = 'default',
  ) {
    return this.providersService.connectProvider(provider, request, userId);
  }

  @Delete(':provider/disconnect')
  @ApiOperation({ summary: 'Disconnect provider for a user' })
  disconnectProvider(@Param('provider') provider: string, @Query('user_id') userId = 'default') {
    return this.providersService.disconnectProvider(provider, userId);
  }
}
