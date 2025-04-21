import categoriesModel from '../dao/categories.model.js'

async function getCategories(req, res) {
    try {
        const categories = await categoriesModel.find();
        if(!categories) return res.status(400).send({ status: "error", error: "No categories found." });
        return res.status(200).send({ status: "success", categories: categories  })
    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message }); 
    }
}

async function createCategory(req, res) {
    try {
        const {name, iconurl} = req.body
        if(!name) return res.status(400).send({ status: "error", error: "Category can't be created without a name." });
        
        const newCategory = {name: name}
        if(iconurl) newCategory.iconUrl = iconurl
        
        const result = await categoriesModel.insertOne(newCategory)
        return res.status(200).send({ status: "success", message: "Category created successfully." })

    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message }); 
    }
}

async function updateCategory(req, res) {
    try {
        const id = req.params.cid;
        const { name, iconurl } = req.body;

        if (!name && !iconurl) {
            return res.status(400).send({ status: "error", error: "No data provided to update." });
        }

        const updateFields = {};
        if (name) updateFields.name = name;
        if (iconurl) updateFields.iconUrl = iconurl;

        const result = await categoriesModel.updateOne(
            { _id: id },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ status: "error", error: "Category not found." });
        }

        return res.status(200).send({ status: "success", message: "Category updated successfully." });
    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message });
    }
}


async function deleteCategory(req, res) {
    try {
        const id = req.params.cid;

        const result = await categoriesModel.deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return res.status(404).send({ status: "error", error: "Category not found." });
        }

        return res.status(200).send({ status: "success", message: "Category deleted successfully." });
    } catch (error) {
        return res.status(500).send({ status: "error", error: error.message });
    }
}



export default {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
}