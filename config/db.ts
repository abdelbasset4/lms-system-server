import mongoose from "mongoose"
require("dotenv").config()
const DB_URL:string = process.env.DB_URI || ""

const dbConntection = async ()=>{    
    try{
        await mongoose.connect(DB_URL).then((data:any)=>{
            console.log(`Connecting to ${data.connection.host}`);
        })
    }catch(err:any){
        console.log(err.message);
        setTimeout(dbConntection, 5000);
    } 
}
export default dbConntection