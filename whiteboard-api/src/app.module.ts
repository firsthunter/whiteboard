import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { SettingsModule } from './settings/settings.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { ModulesModule } from './modules/modules.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { MessagesModule } from './messages/messages.module';
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { LoggerService } from './common/logger.service';
import { LoggingMiddleware } from './common/logging.middleware';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import { MailerService } from './common/mailer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    SettingsModule,
    AssignmentsModule,
    ModulesModule,
    AnnouncementsModule,
    MessagesModule,
    EventsModule,
    NotificationsModule,
    QuizzesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LoggerService,
    LoggingMiddleware,
    GlobalExceptionFilter,
    MailerService,
  ],
  exports: [LoggerService, MailerService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
