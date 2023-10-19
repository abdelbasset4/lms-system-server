
import authRoute from './authRoute';
import userRoute from './userRoute';

const mountRoutes = (app:any)=>{
    // Middelware
    app.use('/api/v1/auth',authRoute)
    app.use('/api/v1/user',userRoute)
}

export default mountRoutes