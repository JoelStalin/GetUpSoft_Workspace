import { Module } from '@nestjs/common';
import { EasyCountAdminController } from './easycount-admin.controller';
import { EasyCountAdminService } from './easycount-admin.service';
import { EasyCountAuthController } from './easycount-auth.controller';
import { EasyCountAuthService } from './easycount-auth.service';
import { EasyCountClienteController } from './easycount-cliente.controller';
import { EasyCountClienteService } from './easycount-cliente.service';
import { EasyCountController } from './easycount.controller';
import { EasyCountDgiiController } from './easycount-dgii.controller';
import { EasyCountEnfcController } from './easycount-enfc.controller';
import { EasyCountExtendedController } from './easycount-extended.controller';
import { EasyCountExtendedService } from './easycount-extended.service';
import { EasyCountInternalController } from './easycount-internal.controller';
import { EasyCountInternalService } from './easycount-internal.service';
import { EasyCountLegacyController } from './easycount-legacy.controller';
import { EasyCountReceptorController } from './easycount-receptor.controller';

@Module({
  controllers: [
    EasyCountController,
    EasyCountAuthController,
    EasyCountDgiiController,
    EasyCountReceptorController,
    EasyCountEnfcController,
    EasyCountClienteController,
    EasyCountAdminController,
    EasyCountExtendedController,
    EasyCountInternalController,
    EasyCountLegacyController,
  ],
  providers: [EasyCountAuthService, EasyCountClienteService, EasyCountAdminService, EasyCountExtendedService, EasyCountInternalService],
})
export class EasyCountModule {}
