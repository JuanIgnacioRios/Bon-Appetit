import mongoose from "mongoose";

const categoriesCollection = "categories";

const categoriesSchema = new mongoose.Schema({
    name: String,
    iconUrl: String,
})

const categoriesModel = mongoose.model(categoriesCollection, categoriesSchema)

export default categoriesModel