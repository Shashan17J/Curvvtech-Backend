import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  dbConnectionString: string;
  jwtSecret: string;
  nodeEnv?: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || "Curvtech",
  dbConnectionString: process.env.MONGODB_URL || "mongodb://localhost:27017",
};

export default config;
