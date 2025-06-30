//utils.js
import bcrypt from 'bcrypt'
import config from './config.js'
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'




export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10))
export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password)

export const generateToken = (user) => {
    const token = jwt.sign(user, config.jwtSignature, { expiresIn: '24h' })
    return token
}

export const authToken = (req, res, next) => {
    let authHeader = req.headers.authorization;
    /*
    if (!authHeader) {
        authHeader = req.cookies.jwt
    } 
    */
    if (!authHeader) {
        return res.status(401).send({ error: "No autenticado" })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, config.jwtSignature, (error, credentials) => {
        if (error || credentials.role == "guest") return res.status(403).send({ error: "No Autorizado" })
        req.user = credentials;
        next();
    })
}

export const session = (req, res, next) => {
    let authHeader = req.headers.authorization;
    /*
    if (!authHeader) {
        authHeader = req.cookies.jwt
    } 
    */
    if (!authHeader) {
        return res.status(401).send({ error: "No autenticado" })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, config.jwtSignature, (error, credentials) => {
        if (error) return res.status(403).send({ error: "No Autorizado" })
        req.user = credentials;
        next();
    })
}

export const adminOnly = (req, res, next) => {
    const adminPassword = req.headers['adminpassword'];

    if (!adminPassword || adminPassword !== config.adminSecret) {
        return res.status(403).send({ error: 'No autorizado. Acceso solo para administradores.' });
    }

    next();
};


export const transport = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth:{
        user: "bonappetittpo@gmail.com",
        pass: config.googlepassword
    },
    tls:{
        rejectUnauthorized: false,
    }
})