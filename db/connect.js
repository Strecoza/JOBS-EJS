const mongoose = require('mongoose')

const connectDB = (url) => {
  return mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    
    //error handler for connect
  }).then (() => {
    console.log("MongoDB connect successfully");
  }).catch ((error) => {
    console.log("MongoDB connect error", error);
  })
}

module.exports = connectDB