import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
let reservations: any[] = [];
const JWT_SECRET = "mysecretkey";

router.get('/reservations', (req: Request, res: Response) => {
    res.send('Hello World from Express and');
});
const prisma = new PrismaClient();

router.get('/reservations/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const reservation = await prisma.reservation.findUnique({
            where: { id: id },
        });
        if (reservation) {
            res.json(reservation);
        } else {
            res.status(404).send('Reservation not found');
        }
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

router.post('/reservations', async (req: Request, res: Response) => {
    try {
        const newReservation = await prisma.reservation.create({
            data: {
                reservationDate: new Date(req.body.reservationDate),
                reservationTime: new Date(req.body.reservationTime),
                reservationDuration: Number(req.body.reservationDuration),
                reservationType: req.body.reservationType,
                reservationStatus: req.body.reservationStatus,
                user: {
                    connect: { id: req.body.user.id },
                },
            }
        });

        res.status(201).json(newReservation);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

router.put('/reservations/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.body.user;

    try {
        const updatedReservation = await prisma.reservation.update({
            where: { id: id },
            data: {
                ...req.body,
                userId: user.id,
            } 
        });
        res.json(updatedReservation);
    } catch (error) {
        res.status(404).send('Reservation not found');
    }
});

router.delete('/reservations/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.reservation.delete({
            where: { id: id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(404).send('Reservation not found');
    }
});

export default router;