import express, { NextFunction, Request, Response } from 'express';
import { routes } from './routes';
import bodyParser from 'body-parser';
import { connectRedis } from './redisClient';

const app = express();
const HOST = 'localhost'
const PORT = 8080
connectRedis()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', routes);

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        message: "404 Error - Not found"
    });
});

app.listen(PORT, () => {
  console.log(`server running : http://${HOST}:${PORT}`);
});
