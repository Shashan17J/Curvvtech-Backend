import { createClient } from "redis";
import config from "./config";

const client = createClient({
  //   username: config.redisUsername,
  //   password: config.redisPassword,
  socket: {
    host: config.redisHost,
    port: config.redisPort,
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));

export async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
    console.log("Redis Connected Successfully");
  }
  return client;
}

export default connectRedis;
