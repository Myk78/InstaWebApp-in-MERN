const mongoose = require("mongoose");
const config = require("config");
mongoose
  .connect(`${config.get("MONGODB_URL")}/Insta_WebAPP`)
  .then(() => {
    console.log("Db is Connected");
  })
  .catch(() => {
    console.log("Something wrong in db Connection");
  });
// export default moongoose.connection;
module.exports = mongoose.connection;
