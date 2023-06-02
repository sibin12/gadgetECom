const mongoose=require('mongoose')
const Schema= mongoose.Schema;

const userSchema=new Schema({
    name:{
        type : String,
        required :true
    },
    email:{
        type : String,
        required :true
    },
    mobile:{
        type : String,
        required :true
    },
    password:{
        type : String,
        required :true
    },
    isActive: {
        type: Boolean,
        default: true
      }
},{
    timestamps:true
})

module.exports=mongoose.model("User",userSchema)