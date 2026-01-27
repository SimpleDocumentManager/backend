import { config } from 'dotenv'
import path from 'path'
import { DataSource, DataSourceOptions } from 'typeorm'

config()

export const dataSourceOptions: DataSourceOptions = {
    type: 'mysql' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'simple_document_manager',
    entities: [path.resolve(__dirname, '**', '*.entity{.js,.ts}')],
    migrations: [path.resolve(__dirname, 'db', 'migrations', '*{.js,.ts}')],
    synchronize: false,
}

const dataSource = new DataSource(dataSourceOptions)
export default dataSource
