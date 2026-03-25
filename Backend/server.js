import { app } from "./src/app.js";
import { ENV } from "./src/config/env.js";
import { connectDB } from "./src/config/db.js";

connectDB().then(() => {
  app.listen(ENV.PORT, () => {
    console.log(`Server running on port ${ENV.PORT}`);
  });
}).catch((err) => {
  console.error("MongoDB connection failed!", err);
  process.exit(1);
});