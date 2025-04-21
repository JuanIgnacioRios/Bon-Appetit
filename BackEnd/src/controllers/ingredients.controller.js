import ingredientsModel from '../dao/ingredients.model.js'

async function getIngredients(req, res) {
    try {
        const ingredients = await ingredientsModel.find();
        if(!ingredients) return res.status(400).send({ status: "error", error: "No ingredients found." });
        return res.status(200).send({ status: "success", ingredients: ingredients  })
    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message }); 
    }
}

async function createIngredient(req, res) {
    try {
        const {name, iconurl} = req.body
        if(!name) return res.status(400).send({ status: "error", error: "Ingredient can't be created without a name." });
        
        const newIngredient = {name: name}
        if(iconurl) newIngredient.iconUrl = iconurl
        
        const result = await ingredientsModel.insertOne(newIngredient)
        return res.status(200).send({ status: "success", message: "Ingredient created successfully." })

    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message }); 
    }
}

async function updateIngredient(req, res) {
    try {
        const id = req.params.cid;
        const { name, iconurl } = req.body;

        if (!name && !iconurl) {
            return res.status(400).send({ status: "error", error: "No data provided to update." });
        }

        const updateFields = {};
        if (name) updateFields.name = name;
        if (iconurl) updateFields.iconUrl = iconurl;

        const result = await ingredientsModel.updateOne(
            { _id: id },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ status: "error", error: "Ingredient not found." });
        }

        return res.status(200).send({ status: "success", message: "Ingredient updated successfully." });
    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message });
    }
}


async function deleteIngredient(req, res) {
    try {
        const id = req.params.cid;

        const result = await ingredientsModel.deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return res.status(404).send({ status: "error", error: "Ingredient not found." });
        }

        return res.status(200).send({ status: "success", message: "Ingredient deleted successfully." });
    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message });
    }
}



export default {
    getIngredients,
    createIngredient,
    updateIngredient,
    deleteIngredient
}