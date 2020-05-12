import { Injectable, Inject } from '@nestjs/common';
import * as dotenv from 'dotenv-safe';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export interface ConfigData {
  //application
  APP_ENV: string;
  APP_PORT?: number;

  //database
  DB_HOST: string;
  DB_PASSWORD: string;
  DB_USERNAME: string;
  DB_TYPE: 'postgres' | 'mongodb';
  DB_PORT?: number;
  DB_DATABASE: string;
  DB_SYNC?: boolean;

  //jwt
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
}

@Injectable()
export class ConfigService {
  private variables: ConfigData;

  constructor() {
    const environment = process.env.NODE_ENV || 'development';
    let data: any = dotenv.config({ path: `${environment}.env` });
    if (data.error) {
      throw new Error(data.error);
    }
    data = data.parsed;

    data.APP_ENV = environment;
    data.DB_PORT = parseInt(data.DB_PROT);
    data.APP_PORT = parseInt(data.DB_PROT);
    this.variables = data as ConfigData;
  }

  read(): ConfigData {
    return this.variables;
  }
  
  isDev(): boolean {
    return this.variables.APP_ENV === 'development';
  }
  isProd(): boolean {
    return this.variables.APP_ENV === 'production';
  }
}
