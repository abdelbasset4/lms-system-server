
import userRoute from './authRoute';

const mountRoutes = (app:any)=>{
    // Middelware
    app.use('/api/v1/auth',userRoute)
}

export default mountRoutes