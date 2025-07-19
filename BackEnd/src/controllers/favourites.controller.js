import recipiesModel from '../dao/recipies.model.js';
import userModel from '../dao/users.model.js'

async function addFavouriteRecipie(req, res) {
    try {
        const recipieId = req.params.rid;

        const user = await userModel.findOne({ _id: req.user._id });

        if (!user) return res.status(400).send({ status: "error", error: "No user found with that ID." });
        if (user.favouriteRecipes.length >= 10) return res.status(400).send({ status: "error", error: "This user has 10 favourite recipes, can't add more." });
        if (user.favouriteRecipes.includes(recipieId)) return res.status(400).send({ status: "error", error: "This recipe is already in user's list." });

        await userModel.updateOne(
            { _id: user._id },
            { $addToSet: { favouriteRecipes: recipieId } }
        );

        return res.status(200).send({
            status: "success",
            message: `Recipe added to user ${user.alias}.`
        });

    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message });
    }
}

async function getFavouriteRecipies(req, res) {
    try {
        const user = await userModel.findOne({ _id: req.user._id }, { favouriteRecipes: 1 });

        if (!user.favouriteRecipes || user.favouriteRecipes.length === 0) {
            return res.status(200).send({ status: "success", recipes: [] });
        }

        const recipes = await recipiesModel.find(
            { 
                _id: { $in: user.favouriteRecipes },
                isVerificated: true
            },
                { title: 1, user: 1, image_url: 1, publishedDate: 1, averageRating: 1, category: 1 }
            );

        return res.status(200).send({ status: "success", recipes });
        
    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message }); 
    }
}


async function deleteFavouriteRecipie(req, res) {
    try {
        const recipieId = req.params.rid;
        if(!recipieId) return res.status(400).send({ status: "error", message: "No recipie ID provided." });

        const result = await userModel.updateOne(
            {_id: req.user._id},
            {$pull: {favouriteRecipes: recipieId}}
        )
        
        return res.status(200).send({ status: "success", message: `Recipie successfully deleted from favourite list of ${req.user.alias}` })
    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message }); 
    }
}


export default {
    addFavouriteRecipie,
    getFavouriteRecipies,
    deleteFavouriteRecipie
}