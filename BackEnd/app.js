import express from 'express'
import mongoose from 'mongoose';
import config from './config.js'

import userRouter from './src/routes/users.router.js';

const app = express();
const PORT = config.port

app.use(express.json());

app.use('/api/users', userRouter)


mongoose.connect(config.mongourl)
    .then(() => {
        console.log("Conectado a la Base de Datos")
    })
    .catch(error => {
        console.error("Error al conectarse a la Base de Datos", error)
    })


app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
})