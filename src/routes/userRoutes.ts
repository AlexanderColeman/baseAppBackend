import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
    const { name, email } = req.body;

    try {
        const result = await prisma.user.create({
            data: {
                name: name,
                email: email,
            }
        }); 
        
        res.json(result);
    } catch (e) { 
        res.status(400).json({error: "Error creating user."});
    }
});
  
router.get('/', async (req, res) => { 
    const allUsers = await prisma.user.findMany();
    res.json(allUsers);
});

router.get('/:id', async (req, res) => { 
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: id } });

    res.json(user);
});

router.put('/:id', (req, res) => { 
    const { id } = req.params;
    const { name, email } = req.body;
    res.send(`User with id ${id} updated.`);
});

router.delete('/:id', (req, res) => { 
    
});

export default router;