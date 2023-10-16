
import authRoute from './authRoute';

const mountRoutes = (app:any)=>{
    // Middelware
    app.use('/api/v1/auth',authRoute)
}

export default mountRoutes