import mongoose from "mongoose";

const ingredientsCollection = "ingredients";

const ingredientsSchema = new mongoose.Schema({
    name: String,
    iconUrl: String,
})

const ingredientsModel = mongoose.model(ingredientsCollection, ingredientsSchema)

export default ingredientsModel