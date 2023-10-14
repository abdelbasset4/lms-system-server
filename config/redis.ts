import {Redis} from "ioredis"

require("dotenv").config()

const redisClient = ()=>{
    if(process.env.REDIS_URL){
        console.log(`redis client connected`);
        return process.env.REDIS_URL
    }
    throw new Error("Redis client not connected")
}
export const redis = new Redis(redisClient())