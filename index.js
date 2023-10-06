const express = require("express");
const { connection } = require("./config/db");
const { userRouter } = require("./routes/userRoute");
const { bookRouter } = require("./routes/bookRoute");
const rateLimit  = require("express-rate-limit")


const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	// store: ... , // Use an external store for more precise rate limiting
})

// Apply the rate limiting middleware to all requests


require("dotenv").config();
const app = express();

app.use(express.json());
app.use(limiter)

app.get("/", (req, res) => {
  res.send("welcome to Library Management System");
});

app.use("/user", userRouter);
app.use("/book", bookRouter);

app.listen(process.env.PORT, async () => {
  try {
    await connection;
    console.log("Connected to DB");
  } catch (err) {
    console.log(err.message);
  }
  console.log(`Server is running at port ${process.env.PORT}`);
});
