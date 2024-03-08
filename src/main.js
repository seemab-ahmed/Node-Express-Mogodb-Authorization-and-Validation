const http = require("http");
const connectDB = require("./config/dbConfig");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const errorMessage = require("./utils/errorMessage")
const { mainRouter } = require("./routes/index");

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection Details:: ${err}`);
});
process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception Details :: ${err}`);
});

// Call the connectDB function to establish the Mongoose connection
connectDB()
  .then(() => {
    const app = express();
    app.server = http.createServer(app);
    if (process.env.NODE_ENV === "development") {
      app.use(morgan("dev"));
    }
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(cors());
    app.use(mainRouter);

    app.use(errorMessage);

    app.server.listen(process.env.PORT || 4000, async () => {
      console.log(
        `🚀 Started server on => http://localhost:${app.server.address().port}`
      );
    });
  })
  .catch((err) => {
    console.error("Error connecting to database:", err.message);
    process.exit(1); // Exit process with failure
  });
