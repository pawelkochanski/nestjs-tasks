import { TypeOrmModuleOptions } from '@nestjs/typeorm'
export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'postgres',
    port: 5432,
    username: 'root',
    password: 'root',
    database: 'nestjs-tasks',
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: true
}
