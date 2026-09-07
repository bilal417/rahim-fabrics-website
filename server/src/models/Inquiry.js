import mongoose from 'mongoose';
const schema=new mongoose.Schema({customerName:{type:String,required:true,trim:true},businessName:String,phone:{type:String,required:true},city:{type:String,required:true},shopType:String,monthlyRequirement:String,productsInterested:[String],message:String,status:{type:String,enum:['new','contacted','closed'],default:'new'}},{timestamps:true});
export default mongoose.model('Inquiry',schema);
