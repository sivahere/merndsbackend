const mongoose = require("mongoose");

//schema design
const userSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:[true,'name is required'],
    },
    email:{
        type:String,
        required:[true,'email is required, need to be unique'],
        unique:true,
    },
    password: {
        type:String,
        required: [true, "password required"],
    },
},
    {timestamps:true}
);

const userModel = mongoose.model('users',userSchema);

module.exports = userModel;