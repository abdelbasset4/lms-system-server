import bcrypt from "bcryptjs"
import mongoose,{Document,Model,Schema} from "mongoose"

const emailRegex:RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g

export interface IUser extends Document {
    name:string;
    email:string;
    password:string;
    avatar:{
        public_id:string;
        url:string;
    };
    role:string;
    isVerified:boolean;
    courses:Array<{courseId:string}>;
    comparePassword: (password:string)=>Promise<boolean>;
}

const userSchema:Schema<IUser> = new mongoose.Schema({
    name:{
        type: String,
        required:[true,"the name is required"]
    },
    email:{
        type: String,
        required:[true,"the email is required"],
        unique: true,
        validate:{
            validator:function(value:string){
                return emailRegex.test(value)
            },
            message:"enter a valid email"

        }
    },
    password:{
        type:String,
        required:[true,"password is required"],
        minlength:[6,"the password must least 6 carachter"]
    },
    avatar:{
        public_id:String,
        url:String,
    },
    role:{
        type:String,
        default:"user"
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    courses:[{
        courseId:String
    }]

},{timestamps:true})

userSchema.pre<IUser>('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password,12);
    next();
})

userSchema.methods.comparePassword = async function(enteredPassword:string):Promise<boolean>{
   return await bcrypt.compare(enteredPassword,this.password) 
}

const User:Model<IUser> = mongoose.model('User',userSchema)

export default User