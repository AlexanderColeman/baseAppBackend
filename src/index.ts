import express from 'express';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import reservationRoutes from './routes/reservationRoutes';
import { authenticateToken } from './middlewares/authMiddlewears';

const app = express();
app.use(express.json());
app.use('/user', authenticateToken , userRoutes);
app.use('/auth', authRoutes);
app.use('/reservation', authenticateToken, reservationRoutes);

app.get('/', (req, res) => {
  res.send('Hello World from Express and');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});