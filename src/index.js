const express = require("express");
const app = express();

const path = require("path");
const dotenv = require("dotenv");
const root_dir = __dirname.split("src")[0];
dotenv.config({ path: path.join(root_dir, `.env`) });

const cors = require("cors");
const bodyParser = require("body-parser");
const connectDb = require("./config/connectDb");

const ifInDev = () => process.env.NODE_ENV === "development";
const morgan = require("morgan");
if (ifInDev()) app.use(morgan("tiny"));

// error handler
const errorHandler = require("./middleware/errorHandler");
const pageNotFound = require("./middleware/pageNotFound");

// routes imports
const indexRoute = require("./index/indexRoute");
const userRoute = require("./user/userRoute");
const campaignRoute = require("./campaign/campaignRoute");

// cors
app.use(cors());
// rate limiting
// app.use(
//   rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 100,
//   })
// );

// to parse JSON payloads in incoming requests.
app.use(express.json());

// connect to mongDb
connectDb(process.env.MONGO_URI);

// start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`http://127.0.0.1:${port}`);
});

// routes
app.use("/api/v1", indexRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/campaigns", campaignRoute);

// middlewares
app.use(errorHandler);
app.use(pageNotFound);
