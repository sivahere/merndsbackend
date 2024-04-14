const express = require("express");
const { addTransaction, getAllTransaction,deleteTransaction} = require("../controllers/transactionctrl");

//router object
const router = express.Router();

//routes
//add-transaction post
router.post("/add-transaction",addTransaction);

//delete-transaction post
router.post("/delete-transaction",deleteTransaction);

//get transaction
router.post("/get-transaction", getAllTransaction);







module.exports = router;