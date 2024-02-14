const mongoose =require("mongoose")
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
      },
      Password: {
        type: String,
        required:  true,
      },
      Owner: {
        type: Boolean,
        required:  false,
      },
    
})
module.exports=mongoose.model("user",userSchema);