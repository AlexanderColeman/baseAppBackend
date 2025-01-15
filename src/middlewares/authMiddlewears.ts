import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const prisma = new PrismaClient();

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const jwtToken = authHeader?.split(' ')[1];

    if (!jwtToken) {
        res.status(401).send('Unauthorized');
        return;
    }

    try {
        const payload = jwt.verify(jwtToken, JWT_SECRET) as JwtPayload;

        // Validate payload and tokenId
        if (!payload || typeof payload.tokenId !== 'string') {
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

        req.body.user = dbToken.user; // Add user to request body
        next(); // Proceed to next middleware or route
    } catch (error) {
        console.error('JWT verification error:', error);
        res.status(401).send('Unauthorized');
    }
}
