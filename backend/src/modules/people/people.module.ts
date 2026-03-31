import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma.module';
import { PeopleService } from './people.service';
import { PeopleController } from './people.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PeopleController],
  providers: [PeopleService],
})
export class PeopleModule {}