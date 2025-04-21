import mongoose from "mongoose";

const recipiesCollection = "recipies";

const recipiesSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    portions: Number,
    image_url: String,
    ingredients: Array,
    user: String,
    publishedDate: Date,
    stepsList: Array,
    averageRating: Number,
    rating: Array,
    aditionalMedia: Array,
    isVerificated: Boolean
})

const recipiesModel = mongoose.model(recipiesCollection, recipiesSchema)

export default recipiesModel