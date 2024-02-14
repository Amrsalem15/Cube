const mongoose =require("mongoose")
const Schema = mongoose.Schema;


const partnersSchema = new Schema({
    Title: {
        type: String,
        required: true,
      },
      ImageName: {
        type: String,
        required: true,
      }
});

module.exports=mongoose.model("partners",partnersSchema);