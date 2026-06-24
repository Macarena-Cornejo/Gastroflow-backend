import { registerAs } from '@nestjs/config';
import { environment } from './enviroment';

export const typeOrmConfig = registerAs('typeorm', () => {
  const databaseUrl = environment.DATABASE_URL ?? '';
  const isLocalDatabase = /localhost|127\.0\.0\.1/.test(databaseUrl);
  const useSsl = process.env.DATABASE_SSL
    ? process.env.DATABASE_SSL === 'true'
    : !isLocalDatabase;

  return {
    type: 'postgres',
    url: databaseUrl,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    extra: useSsl ? { ssl: { rejectUnauthorized: false } } : {},
    autoLoadEntities: true,
    synchronize: isLocalDatabase,
    logging: true,
    dropSchema: false,
  };
});
