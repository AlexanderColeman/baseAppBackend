import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction, Router } from "express";
import jwt from 'jsonwebtoken';

const JWT_SECRET = "mysecretkey";
const prisma = new PrismaClient();

export async function authenticateToken (req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const jwtToken = authHeader?.split(' ')[1];

    if (!jwtToken) {
        res.status(401).send('Unauthorized');
        return;
    }

    try {
        const payload = jwt.verify(jwtToken, JWT_SECRET) as { tokenId: string };
        if (!payload || typeof payload.tokenId !== 'string' || !payload.tokenId) { 
            res.status(401).send('Unauthorized');
            return;
        }

        const dbToken = await prisma.token.findUnique({
            where: { id: payload.tokenId },
            include: { user: true },
        });

        if (!dbToken || !dbToken.valid || dbToken.expiration < new Date()) {
            res.status(401).send('Unauthorized');
            return;
        }

        req.body.user = dbToken.user;

        next();
        
    } catch (error) {
        res.status(401).send('Unauthorized');
    }
};