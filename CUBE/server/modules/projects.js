const mongoose =require("mongoose")
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    Title: {
        type: String,
        required: true,
      },
      Description: {
        type: String,
        required: true,
      },
      CoverImage: {
        type: String,
        required: true,
      },
      Category: {
        type: String,
        required: true,
      },
      Client: {
        type: String,
        required: true,
      },
      Date: {
        type: String,
        required: true,
      },
      SliderImages: {
        type: [String],
        required: true,

      }
      ,
      
});

module.exports=mongoose.model("projects",projectSchema);