import express from 'express';
import { registerNewUser } from '../services/authService';

const route = express.Router()

route.post('register',registerNewUser)

export default route