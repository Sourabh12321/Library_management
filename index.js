const express = require("express");
const { connection } = require("./config/db");
const { userRouter } = require("./routes/userRoute");
const { bookRouter } = require("./routes/bookRoute");

require("dotenv").config();
const app = express();

app.use(express.json());

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
