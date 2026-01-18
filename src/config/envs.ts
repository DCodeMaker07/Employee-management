import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
    PORT: number;
    DATABASE_URL: string;
    NODE_ENV: string;
    REDIS_URL: string;
}

const envsSchema = joi.object({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
    NODE_ENV: joi.string().required(),
    REDIS_URL: joi.string().required(),
})
.unknown(true)

const { error, value } = envsSchema.validate({ ...process.env });

if ( error ) {
    throw new Error(`Config validation error: ${ error.message }`)
}

const envVars: EnvVars = value;

export const envs = {
    port: envVars.PORT,
    databaseUrl: envVars.DATABASE_URL,
    nodeEnv: envVars.NODE_ENV,
    redisUrl: envVars.REDIS_URL,
}