import dotenv from "dotenv";
import connctDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

connctDB()
  .then(() => {
    console.log("connected to db");
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
