import express, { Request, Response, NextFunction } from 'express';
import { join } from 'node:path';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: "*"
}))
app.use(express.static(join(__dirname, '..', "..", 'frontend', 'dist')))

app.get("/", (req: Request, res: Response, next: NextFunction): void =>{
    res.sendFile(join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
})

module.exports = app