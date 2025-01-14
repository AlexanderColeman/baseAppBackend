import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from 'jsonwebtoken'; 
import { env } from "node:process";

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;
const API_TOKEN_EXPIRATION_MINUTES = 12;
const JWT_SECRET = "mysecretkey";

const router = Router();
const prisma = new PrismaClient();

function generateEmailToken(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

function generateAuthToken(tokenId: string): string {
    const jwtPayload = { tokenId };

    return jwt.sign(jwtPayload, JWT_SECRET, { 
        algorithm: 'HS256',
        noTimestamp: true
    });
}

router.post('/login', async (req, res) => {
    const { email } = req.body;

    const emailToken = generateEmailToken();
    const expiration = new Date(new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000);

    try {
        await prisma.token.create({
            data: {
                type: 'EMAIL',
                emailToken,
                expiration, 
                user: {
                    connectOrCreate: { 
                        where: { email },
                        create: { email } 
                    }
                }
            }
        });
        res.sendStatus(200);
    } catch (error) {
        res.status(400).json({ error: 'User already exists' });
    }
});

router.post('/authenticate', async (req, res) => { 
    const { email, emailToken } = req.body;

    const dbEmailToken = await prisma.token.findUnique({ 
        where: {
            emailToken
        },
        include: {
            user: true
        },
    });

    if (!dbEmailToken || !dbEmailToken.valid) {
        res.status(401).json({ error: 'Invalid Request' });
        return;
    }

    if (dbEmailToken) {

        if (dbEmailToken.expiration < new Date()) { 
            res.status(401).json({ error: 'Invalid Request' });
            return;
        }
    
        if (dbEmailToken.user.email !== email) {
            res.status(401).json({ error: 'Invalid Request' });
            return;
        }
    
    
        const expiration = new Date(new Date().getTime() + API_TOKEN_EXPIRATION_MINUTES * 60 * 60 * 1000);
        const apiToken = await prisma.token.create({
            data: {
                type: 'JWT',
                expiration,
                user: {
                    connect: { 
                        email 
                    }
                }
            }
        });
    
        await prisma.token.update({
            where: { id: dbEmailToken.id },
            data: { valid: false }
        });

        const authToken = generateAuthToken(apiToken.id);
    
        res.json({ authToken });
    }    
});

export default router;