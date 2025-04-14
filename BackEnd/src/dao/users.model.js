import mongoose from "mongoose";

const usersCollection = "users";

const usersSchema = new mongoose.Schema({
    email: String,
    name: String,
    alias: String,
    password: String,
    favouriteRecipes: Array,
    resetCode: Number,
    resetCodeExpires: Date
})

const usersModel = mongoose.model(usersCollection, usersSchema)

export default usersModel