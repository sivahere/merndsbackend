const express = require("express");
const cors = require("cors");
const morgan  = require("morgan");
const dotenv = require("dotenv");
const colors = require("colors");
const connectDb = require("./config/connectDb");
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
// const https = require('https');
// const fs = require('fs');
// const path = require('path');


//config env file
dotenv.config();

//database call
connectDb(); 

 //rest object
 const app = express();


 //middlewares
 app.use(morgan("dev"));
 app.use(cors());
 app.use(express.json());

//for verifying csrf tokens
 app.use(cookieParser());
 app.use(csrf({ cookie: true }));

 //routes
 //user routes
app.use("/api/v1/users", require("./routes/userRoute"));

//trannsaction route
app.use("/api/v1/transactions",require("./routes/transactionRoute"));

app.get("/api/v1/csrf-token", (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});


//port 
const PORT = 8080 || process.env.PORT;

//listen server
app.listen(PORT, () => {
    console.log("Server running on port "+PORT);
});

// const sslServer = https.createServer({
//     key: fs.readFileSync('./cert/server.key'),
//     cert: fs.readFileSync('./cert/server.key')
// },app);

// sslServer.listen(PORT, () => {
//          console.log("Server running on port "+PORT);
//      });
 