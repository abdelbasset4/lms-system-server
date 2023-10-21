
import authRoute from './authRoute';
import userRoute from './userRoute';
import courseRoute from './courseRoute';

const mountRoutes = (app:any)=>{
    // Middelware
    app.use('/api/v1/auth',authRoute)
    app.use('/api/v1/user',userRoute)
    app.use('/api/v1/course',courseRoute)
}

export default mountRoutes