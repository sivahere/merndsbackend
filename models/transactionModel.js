const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    userid:{
        type:String,
        required:true,
    },
    typeOfTreatment :{
        type:String,
        required:[true,"type of treatment required"]
    },
    typeOfCortisoid :{
        type:String,
        required:[true,"type of cortisoid required"]
    },
    noOfBolus :{
        type:Number
    },
    noOfInjection :{
        type:Number
    },
    dosePerDay :{
        type:Number
    },
    noOfDays :{
        type:Number,
    },
    startDate :{
        type:String
    },
    endDate :{
        type:String
    }


},{timestamps:true});

const transactionModel = mongoose.model("transactions",transactionSchema);

module.exports = transactionModel;