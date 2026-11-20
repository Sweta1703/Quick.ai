import 'dotenv/config'
import express from 'express'
import { clerkMiddleware } from '@clerk/express'
import cors from 'cors'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import { initDB } from './configs/db.js';
import userRouter from './routes/userRoutes.js';

const app = express();
await connectCloudinary()
await initDB()
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());
app.get('/', (req, res) => res.send('Server is live!'))
app.use('/api/ai', aiRouter)
app.use('/api/user', userRouter)
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('Server is running on port ', PORT);
  });
}

export default app;