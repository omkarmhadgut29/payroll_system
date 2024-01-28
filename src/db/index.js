import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connctDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_CONNECTION_URL}/${DB_NAME}`
    );
    console.log(
      `MongoDB connection Success. Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB connection error: ", error);
    process.exit();
  }
};

export default connctDB;
