import { v4 as uuidv4 } from 'uuid';
import recipiesModel from '../dao/recipies.model.js'

async function createRecipie(req, res) {
  try {
    const {
      title,
      description,
      category,
      portions,
      ingredients,
      stepsList,
      aditionalMedia,
    } = req.body;

    if (!title || !category || !portions || !ingredients || !stepsList) {
      return res.status(400).send({
        status: "error",
        error: "A Title, category, portions, ingredients and stepsList are required.",
      });
    }

    const parsedIngredients = ingredients || '[]';
    const parsedStepsList = stepsList || '[]';
    const parsedAditionalMedia = aditionalMedia || '[]';

    const image_url = req.file?.path || "";
    console.log('📎 Imagen subida:', req.file);

    const newRecipie = {
      title,
      description: description || "",
      category,
      portions,
      user: req.user.alias,
      image_url,
      ingredients: parsedIngredients,
      stepsList: parsedStepsList,
      aditionalMedia: parsedAditionalMedia,
      publishedDate: Date.now(),
      averageRating: 0,
      rating: [],
      isVerificated: false
    };

    const result = await recipiesModel.create(newRecipie);
    return res.status(200).send({
      status: "success",
      message: "Recipie created successfully",
      payload: result,
    });

  } catch (error) {
    return res.status(500).send({
      status: 'error',
      error: error.message
    });
  }
}


async function getRecipies(req, res) {
    try {
        const {
            title,
            user,
            category,
            contains,
            notContains,
            isVerificated,
            limit = 100,
            sortBy = "title",
            order = "asc"
        } = req.query;

        const parsedLimit = Number(limit);
        if (isNaN(parsedLimit) || parsedLimit <= 0) {
            return res.status(400).send({ status: "error", error: "'limit' debe ser un número mayor a 0" });
        }

        const validSortFields = ["title", "user", "publishedDate", "averageRating", "category"];
        if (!validSortFields.includes(sortBy)) {
            return res.status(400).send({ status: "error", error: `'sortBy' debe ser uno de: ${validSortFields.join(", ")}` });
        }

        if (!["asc", "desc"].includes(order)) {
            return res.status(400).send({ status: "error", error: "'order' debe ser 'asc' o 'desc'" });
        }

        if (contains && typeof contains !== "string" && !Array.isArray(contains)) {
            return res.status(400).send({ status: "error", error: "'contains' debe ser un string o un array" });
        }

        if (notContains && typeof notContains !== "string" && !Array.isArray(notContains)) {
            return res.status(400).send({ status: "error", error: "'notContains' debe ser un string o un array" });
        }

        const query = {};

        if (title) {
            query.title = { $regex: title, $options: "i" };
        }

        if (user) {
            query.user = { $regex: user, $options: "i" };
        }

        if (category) {
            query.category = category;
        }

        if (isVerificated !== undefined) {
            if (isVerificated !== 'true' && isVerificated !== 'false') {
                return res.status(400).send({ status: "error", error: "'isVerificated' debe ser 'true' o 'false'" });
            }
            query.isVerificated = isVerificated === 'true';
        }

        if (contains) {
            const containsArray = Array.isArray(contains)
                ? contains
                : contains.split(",").map(i => i.trim());
            query["ingredients.name"] = { $all: containsArray };
        }

        if (notContains) {
            const notContainsArray = Array.isArray(notContains)
                ? notContains
                : notContains.split(",").map(i => i.trim());

            if (!query["ingredients.name"]) {
                query["ingredients.name"] = { $nin: notContainsArray };
            } else {
                query["ingredients.name"].$nin = notContainsArray;
            }
        }

        const sortOrder = order === "asc" ? 1 : -1;

        const recipes = await recipiesModel
            .find(query, {
                title: 1,
                user: 1,
                image_url: 1,
                publishedDate: 1,
                averageRating: 1,
                category: 1
            })
            .limit(parsedLimit)
            .sort({ [sortBy]: sortOrder });

        return res.status(200).send({ status: "success", payload: recipes });
    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message });
    }
}



async function getRecipie(req, res) {
    try {
        const recipieId = req.params.rid;
        if (!recipieId) return res.status(400).send({ status: "error", error: "No recipie ID provided." });
        const recipie = await recipiesModel.find({ _id: recipieId })
        if (!recipie) return res.status(400).send({ status: "error", error: "There is no recipie with that ID." });
        return res.status(200).send({ status: "success", payload: recipie })
    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message });
    }
}

async function updateRecipie(req, res) {
    const id  = req.params.rid;

    if (!id) return res.status(400).send({ status: "error", error: "Missing recipe ID" });

    const allowedFields = ['title', 'description', 'category', 'portions', 'image_url', 'ingredients', 'stepsList', 'aditionalMedia'];

    const updateFields = Object.fromEntries(
        Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).send({ status: "error", error: "No valid fields provided to update." });
    }

    updateFields.isVerificated = false;

    try {
        const recipie = await recipiesModel.findById(id);
        if (!recipie) return res.status(404).send({ status: "error", error: "Recipie not found" });

        if (recipie.user !== req.user.alias) {
            return res.status(403).send({ status: "error", error: "No autorizado para modificar esta receta" });
        }

        const updatedRecipie = await recipiesModel.findByIdAndUpdate(id, updateFields, { new: true });

        return res.status(200).send({ status: "success", message: "Recipie updated successfully", payload: updatedRecipie });
    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message });
    }
}




async function verificateRecipie(req, res) {
    try {
        const recipieId = req.params.rid;
        if (!recipieId) return res.status(400).send({ status: "error", error: "No recipie ID provided." });
        await recipiesModel.updateOne(
            {_id: recipieId},
            {$set: {isVerificated: true}}
        )

        return res.status(200).send({ status: "success", message: "Recipie verificated." })
    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message });
    }
}

async function rateRecipie(req, res) {
    try {
        const recipieId = req.params.rid;
        if (!recipieId) return res.status(400).send({ status: "error", error: "No recipe ID provided." });

        const { rate, comment } = req.body;
        if (!rate) return res.status(400).send({ status: "error", error: "No rate provided." });

        const recipie = await recipiesModel.findById(recipieId);
        if (!recipie) return res.status(404).send({ status: "error", error: "Recipe not found." });

        const newValoration = {
            id: uuidv4(),
            rate,
            user: req.user.alias,
            createdAt: Date.now()
        };

        if (comment) {
            newValoration.comment = comment;
            newValoration.isCommentVerified = false;
        }

        const totalRatings = recipie.rating.length;
        const totalSum = recipie.rating.reduce((acc, curr) => acc + curr.rate, 0);
        const newAverage = (totalSum + rate) / (totalRatings + 1);

        await recipiesModel.updateOne(
            { _id: recipieId },
            {
                $push: { rating: newValoration },
                $set: { averageRating: newAverage }
            }
        );

        return res.status(200).send({ status: "success", message: "Rating added successfully." });
    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message });
    }
}


async function getApprovedRatings(req, res) {
    try {
        const recipieId = req.params.rid;

        if (!recipieId) {
            return res.status(400).send({ status: "error", error: "No recipe ID provided." });
        }

        const recipie = await recipiesModel.findById(recipieId, {
            rating: 1,
            _id: 0
        });

        if (!recipie) {
            return res.status(404).send({ status: "error", error: "Recipe not found." });
        }

        const approvedRatings = recipie.rating.filter(r => r.isCommentVerified);

        return res.status(200).send({
            status: "success",
            payload: approvedRatings
        });
    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message });
    }
}

async function validateRating(req, res) {
    const { rid, ratingId } = req.params;

    if (!rid || !ratingId) {
        return res.status(400).send({ status: "error", error: "Recipe ID and rating ID are required." });
    }

    try {
        const recipie = await recipiesModel.findById(rid);
        if (!recipie) {
            return res.status(404).send({ status: "error", error: "Recipe not found." });
        }

        const ratingIndex = recipie.rating.findIndex(r => r.id === ratingId);
        if (ratingIndex === -1) {
            return res.status(404).send({ status: "error", error: "Rating not found." });
        }

        recipie.rating[ratingIndex].isCommentVerified = true;
        recipie.markModified('rating');

        await recipie.save();

        return res.status(200).send({ status: "success", message: "Rating verified successfully." });
    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message });
    }
}


export default {
    createRecipie,
    getRecipies,
    getRecipie,
    updateRecipie,
    verificateRecipie,
    rateRecipie,
    getApprovedRatings,
    validateRating
}