const transactionModel = require("../models/transactionModel");
const csrf = require('csurf');
// Create CSRF middleware instance
const csrfProtection = csrf({ cookie: true });

// const validateCSRFToken = (req, res, next) => {
//     const csrfToken = req.headers['x-csrf-token'];
//     if (!csrfToken || csrfToken !== req.session.csrfToken) {
//       return res.status(403).json({ message: 'Invalid CSRF token' });
//     }
//     // Log CSRF token
//     console.log("CSRF token:", csrfToken);
//     next();
//   };

const getAllTransaction = async(req,res) => {
    try {
        const transactions = await transactionModel.find({userid:req.body.userid});
        res.status(201).json(transactions);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}




const addTransaction = async(req,res) => {
    try {
        const newTransaction = new transactionModel(req.body);
        await newTransaction.save();
        res.status(201).send("Transaction created");
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}


const deleteTransaction = async(req,res) => {
    try {
        await transactionModel.findOneAndDelete({_id:req.body.transactionId});
        res.status(200).send("Dosage deleted");
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};



module.exports = {getAllTransaction,addTransaction,deleteTransaction}