import authRoute from './authRoute';
import userRoute from './userRoute';
import courseRoute from './courseRoute';
import orderRoute from './orderRoute';
import notificationRoute from './notificationRoute';
import analyticsRoute from './analyticsRoute';
import layoutRoute from './layoutRoute';

const mountRoutes = (app:any)=>{
    // Middelware
    app.use('/api/v1/auth',authRoute)
    app.use('/api/v1/user',userRoute)
    app.use('/api/v1/course',courseRoute)
    app.use('/api/v1/order',orderRoute)
    app.use('/api/v1/notification',notificationRoute)
    app.use('/api/v1/analytics',analyticsRoute)
    app.use('/api/v1/layout',layoutRoute)
}

export default mountRoutes