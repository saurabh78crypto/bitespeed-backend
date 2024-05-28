import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import indentifyRouter from './identify.js';
import dotenv from 'dotenv';

import './db.js';

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.listen(process.env.PORT, () => {
    console.log(`Server runnning on port ${process.env.PORT}`);
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use('/identify', indentifyRouter);

export default {app}