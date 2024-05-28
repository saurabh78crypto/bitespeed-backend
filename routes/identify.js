import express from "express";

const router = express.Router();

async function identify(req, res) {
    try {
        
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
}

router.post('/', identify);

module.exports = router;