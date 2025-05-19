import dotenv from 'dotenv'

dotenv.config()

export default {
    port: process.env.PORT,
    mongourl: process.env.MONGO_URL,
    jwtSignature: process.env.JWT_SIGNATURE,
    adminSecret: process.env.ADMIN_PASSWORD,
    googlepassword: process.env.GOOGLE_PASSWORD
}