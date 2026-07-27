import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { DatabaseSeederService } from './seeder.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { OrganizationsModule } from '../organizations/organizations.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    OrganizationsModule,
    MailModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, DatabaseSeederService],
  exports: [UsersService],
})
export class UsersModule {}

