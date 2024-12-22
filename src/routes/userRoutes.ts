import { Router } from "express";

const router = Router();

router.post('/', (req, res) => {
    const { name, email } = req.body;
    res.send(`User ${name} with email ${email} created.`);
});
  
router.get('/', (req, res) => { 
    res.send('User list');
});

router.get('/:id', (req, res) => { 
    const { id } = req.params;
    res.send(`User with id ${id} found.`);
});

router.put('/:id', (req, res) => { 
    const { id } = req.params;
    const { name, email } = req.body;
    res.send(`User with id ${id} updated.`);
});

router.delete('/:id', (req, res) => { 
    
});

export default router;