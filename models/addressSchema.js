const mongoose = require('mongoose');
const { MediaRecordingPage } = require('twilio/lib/rest/media/v1/mediaRecording');
const Schema = mongoose.Schema;

const addressSchema =new Schema({
   user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
   },
   address:[
    {
    firstName:{
     type:String,
     required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    number:{
        type:Number,
        required:true
    },
    streetAddress:{
        type:String,
        required:true
    },
    appartment:{
        type:String,
        required:true
    },
    town:{
        type:String,
        required:true
    },
    district:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    pin:{
        type:String,
        required:true
    },
}
   ]

})
 module.exports = mongoose.model("Address",addressSchema)