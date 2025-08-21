import mongoose from "mongoose";
import config from "./config";

const connect = async (): Promise<string> => {
  const options = {
    maxPoolSize: 10, // Maximum number of connections in the pool
    minPoolSize: 1, // Minimum number of idle connections
    serverSelectionTimeoutMS: 5000, // Timeout for server selection
  };
  try {
    await mongoose.connect(config.dbConnectionString, options);
    console.log("DB Connected Successfully");
    return "DB Connected Successfully";
  } catch (err) {
    console.error("DB Connection Failed");
    console.error(err);
    return "DB Connection Failed";
  }
};

export default connect;
