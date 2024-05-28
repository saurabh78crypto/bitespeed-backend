import bodyParser from 'body-parser';
import express from 'express';
import identifyRouter from './routes/identify'
import dotenv from 'dotenv';

dotenv.config();

const app = express();


app.use(bodyParser.json());
app.use(cors());

app.use('/identify', identifyRouter);

app.listen(process.env.PORT, () => {
    console.log(`Server runnning on port ${process.env.PORT}`);
});