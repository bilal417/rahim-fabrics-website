import mongoose from 'mongoose'; import bcrypt from 'bcryptjs';
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true},phone:String,email:{type:String,required:true,unique:true,lowercase:true,trim:true},password:{type:String,required:true,select:false},role:{type:String,enum:['admin','staff'],default:'staff'}},{timestamps:true});
schema.pre('save',async function(next){if(!this.isModified('password'))return next();this.password=await bcrypt.hash(this.password,12);next()});
schema.methods.comparePassword=function(value){return bcrypt.compare(value,this.password)};
export default mongoose.model('User',schema);
