import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true},slug:{type:String,unique:true,index:true},code:{type:String,required:true,unique:true,uppercase:true,trim:true},category:{type:String,required:true,index:true},fabricType:{type:String,required:true},colors:[String],thaanLength:{type:String,required:true},suitsPerThaan:{type:Number,required:true,min:1},stock:{type:Number,default:0,min:0},images:[{url:String,publicId:String}],description:{type:String,required:true},featured:{type:Boolean,default:false}},{timestamps:true});
schema.pre('validate',function(next){if(!this.slug&&this.name)this.slug=this.name.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');next()});
export default mongoose.model('Product',schema);
