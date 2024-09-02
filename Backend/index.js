const express = require("express");
const cors = require("cors");
const connection = require("./Connection.js");
const UserRouter = require("./route/user.js");
const AdminRouter=require("./route/admin.js")
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 7000;


app.use(cors())

app.use(express.json());

// Define routes
app.use("/user", UserRouter);
app.use("/admin",AdminRouter)

app.listen(PORT, () => {
  console.log("The Port number is", PORT);
});


process.on("SIGINT", () => {
  connection.end((err) => {
    if (err) {
      console.log("The Disconnection process for Database has some Error", err);
    } else {
      console.log("Successfully Disconnected the Database");
    }
    process.exit();
  });
});
