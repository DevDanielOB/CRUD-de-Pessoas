import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma.module';
import { PeopleService } from './people.service';
import { PeopleController } from './people.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PeopleController],
  providers: [PeopleService],
})
export class PeopleModule {}
