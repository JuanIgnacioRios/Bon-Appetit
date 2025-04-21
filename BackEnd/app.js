import express from 'express'
import mongoose from 'mongoose';
import config from './config.js'

import userRouter from './src/routes/users.router.js';
import recipiesRouter from './src/routes/recipies.router.js';
import favoutitesRouter from './src/routes/favourites.router.js'
import categoriesRouter from './src/routes/categories.router.js'
import ingredientsRouter from './src/routes/ingredients.router.js'
import adminRouter from './src/routes/admin.router.js'
import { adminOnly } from './utils.js';

const app = express();
const PORT = config.port

app.use(express.json());

app.use('/api/users', userRouter)
app.use('/api/recipies', recipiesRouter)
app.use('/api/favourite-recipies', favoutitesRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/ingredients', ingredientsRouter)
app.use('/api/admin', adminOnly, adminRouter)


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