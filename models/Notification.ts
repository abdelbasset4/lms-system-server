import mongoose ,{Document,Schema,Model} from "mongoose";
export interface INotification extends Document{
    userId:string,
    title:string,
    message:string,
    read:boolean
}
const NotificationSchema:Schema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    title:{
        type:String,
        required:[true,"the title is required"]
    },
    message:{
        type:String,
        required:[true,"the message is required"]
    },
    read:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

const Notification:Model<INotification> = mongoose.model<INotification>('Notification',NotificationSchema);
export default Notification;