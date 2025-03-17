import express from "express";
import { dbConnection } from "./Database/dbConnection.js";
import { bootstrap } from "./src/bootstrap.js";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from 'cors'
import http from "http";
import { createOnlineOrder } from "./src/modules/order/order.controller.js";
import {chatSockets} from "./src/modules/chat/chat.sockets.js"

dotenv.config();
const app = express();
app.use(cors())

const port = 3000;
app.post('/webhook', express.raw({type: 'application/json'}),createOnlineOrder );
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("uploads"));



const server = http.createServer(app);
chatSockets(server);
bootstrap(app);
dbConnection();
server.listen(process.env.PORT || port, () => console.log(`Example app listening on port ${port}!`));
