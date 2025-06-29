//src/controllers/users.controller.js
import { createHash, isValidPassword, generateToken, transport } from '../../utils.js'
import usersModel from '../dao/users.model.js'

async function register(req, res) {
    const { email, name, alias, password } = req.body;
    if ( !email || !name || !alias || !password) return res.status(400).send({status: "error", error: "Email, name, alias and password are required for register"});
    try {
        const exist = await usersModel.findOne({ $or: [{ email }, { alias }] });
        if(exist) return res.status(400).send({ status: "error", error: "There is an user already registered with that email or alias."});
        const newUser = {
            email,
            name,
            alias,
            password: createHash(password),
            favouriteRecipes: []
        };
        let result = await usersModel.create(newUser);
        return res.status(200).send({ status: "success", message: "User created successfully", payload: result });
    } catch (error) {
        return res.status(500).send({ status: 'error',error: error.message});
    }
}

async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({ status: "error", error: "Email and password are required for login" });
    }

    try {
        const user = await usersModel.findOne({ email });
        if (!user) {
            return res.status(400).send({ status: 'error', error: 'No user found with that email' });
        }

        if (!isValidPassword(user, password)) {
            return res.status(400).send({ status: 'error', error: 'Incorrect password' });
        }

        const userWithoutPassword = { ...user.toObject() };
        const accessToken = generateToken({
            _id: userWithoutPassword._id,
            name: userWithoutPassword.name,
            email: userWithoutPassword.email,
            alias: userWithoutPassword.alias,
            role: "user"
        });

        return res.status(200).send({ status: 'success', message: 'Login successful', token: accessToken });
    } catch (error) {
        return res.status(500).send({ status: 'error', error: error.message });
    }
}


async function sendChangePasswordVerificationCode(req, res) {
    const { email } = req.body;
    if (!email)
        return res.status(400).send({
            status: "error",
            error: "An email address is required to send the password change verification code."
        });

    try {
        const exist = await usersModel.findOne({ email });
        if (!exist)
            return res.status(400).send({
                status: "error",
                error: "There isn't any user registered with that email."
            });

        const verificationCode = Math.floor(100000 + Math.random() * 900000);

        await usersModel.updateOne(
            { email },
            {
                $set: {
                    resetCode: verificationCode,
                    resetCodeExpires: Date.now() + 10 * 60 * 1000,
                },
            }
        );

        let emailresponse = await transport.sendMail({
        from: "bonappetittpo@gmail.com", 
        to: email,
        subject: "BonAppetit | Restablece tu contraseña",
        html: `
            <p>¡Hola! ¿Cómo estás?</p>
            <p>Recibimos una solicitud para restablecer tu contraseña. Ingresá el siguiente código en la aplicación para continuar:</p>
            <h2 style="letter-spacing: 2px;">${verificationCode}</h2>
            <p>Por tu seguridad, no compartas este código con nadie.</p>
            <p>Gracias por confiar en <b>BonAppetit</b>.</p>
        `
    });

        return res.status(200).send({
            status: "success",
            message: `Verification code sent to ${email}.`
        });
    } catch (error) {
        return res.status(500).send({
            status: 'error',
            error: error.message
        });
    }
}


async function verifyChangePasswordVerificationCode(req, res){
    const { verificationCode, email } = req.body;
    if( !verificationCode || !email ) return res.status(400).send({status: "error", error: "A verification code and an email is required to change your password."});
    try {
        const exist = await usersModel.findOne({ email });
        if (!exist) return res.status(400).send({ status: "error", error: "There isn't any user registered with that email."});      
        
        if (exist.resetCode !== verificationCode || Date.now() > exist.resetCodeExpires) {
            return res.status(400).send({ status: "error", error: "Invalid verification code." });
        }

        return res.status(200). send({status: "success", message: 'Verification code is correct.'});
    } catch (error) {
        return res.status(500).send({ status: 'error',error: error.message});
    }
}

async function changePassword(req, res){
    const { verificationCode, newPassword, email } = req.body;
    if( !verificationCode || !newPassword || !email ) return res.status(400).send({status: "error", error: "A verification code, email and new password is required to change your password."});
    try {
        const user = await usersModel.findOne({ email });
        
        if (!user) return res.status(400).send({ status: "error", error: "There isn't any user registered with that email." });

        if (user.resetCode !== verificationCode || !user.resetCodeExpires || Date.now() > user.resetCodeExpires) {
            return res.status(400).send({ status: "error", error: "Invalid verification code." });
        }

        const result = await usersModel.updateOne({ email },
            {
                $set: { password: createHash(newPassword) },
                $unset: { resetCode: "", resetCodeExpires: "" }
            }
        );

        return res.status(200).send({ status: "success", message: "Password updated successfully."});

    } catch (error) {
        return res.status(500).send({ status: 'error',error: error.message});
    }
} 

async function getUser(req, res) {
    const { uid } = req.params;
    try{
        const user = await usersModel.findOne({ _id: uid }).select('-password');
        if (!user) return res.status(400).send({ status: "error", error: "There isn't any user with that id." });
        return res.status(200).send({ status: "success", user: user });
    }catch(error) {
        return res.status(500).send({ status: 'error',error: error.message});
    }
}

async function getSession( req, res) {
    res.status(200).send({ status: "success", user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        alias: req.user.alias,
        role: req.user.role
    }})
}

async function guest(req, res) {
    const accessToken = generateToken({
       role: "guest"
    });
    return res.status(200).send({ status: 'success', message: 'Login successful', token: accessToken });
}



export default {
    register,
    login,
    sendChangePasswordVerificationCode,
    verifyChangePasswordVerificationCode,
    changePassword,
    getUser,
    getSession,
    guest
}