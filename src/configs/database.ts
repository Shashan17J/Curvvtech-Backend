import mongoose from "mongoose";
import config from "./config";

const connect = () => {
  console.log(config.dbConnectionString);
  mongoose
    .connect(config.dbConnectionString)
    .then(() => console.log("DB Connected Successfully"))
    .catch((err) => {
      console.error(`DB Connection Failed`);
      console.error(err);
      process.exit(1);
    });
};

export default connect;
