import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  dbConnectionString: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  redisUsername: string;
  redisPassword: string;
  redisHost: string;
  redisPort: number;
  nodeEnv?: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || "Curvvtech",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "CurvvtechRef",
  dbConnectionString: process.env.MONGODB_URL || "mongodb://localhost:27017",
  redisUsername: process.env.REDIS_DB_USERNAME!,
  redisPassword: process.env.REDIS_DB_PASSWORD!,
  redisHost: process.env.REDIS_DB_HOST!,
  redisPort: Number(process.env.REDIS_DB_PORT),
};

export default config;
