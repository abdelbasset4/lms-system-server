import mongoose ,{Document,Schema,Model} from "mongoose";
export interface IOrder extends Document{
    courseId:string,
    userId:string,
    payment:object
}
const OrderSchema:Schema = new Schema({
    courseId:{
        type:Schema.Types.ObjectId,
        ref:"Course"
        // in course this is string
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User"
         // in course this is string
    },
    payment:{
        type:Object,
        required:true
    }
},{timestamps:true});

const Order:Model<IOrder> = mongoose.model<IOrder>('Order',OrderSchema);
export default Order;