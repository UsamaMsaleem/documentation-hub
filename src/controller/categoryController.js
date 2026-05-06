import Category from '../models/Category.js'
import WorkspaceMember from '../models/WorkspaceMember.js'

export const createCategory = async (req, res) => {
    try {
        const { name, workspaceId } = req.body

        const member = await WorkspaceMember.findOne({
            workspaceId,
            userId: req.user._id
        });

        if (!member) {
            return res.status(403).json({
                message: 'Access denied'
            })
        };

        const category = await Category.create({
            name,
            workspaceId
        });

        res.json({
            message: 'Category Created',
            category
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    };
};

export const getCategories = async (req, res) => {
    try {
        const { workspaceId } = req.params;

        const categories = await Category.find({ workspaceId });

        res.json(categories);

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    };
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        res.json({
            message: 'Category update',
            category
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    };
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        await Category.findByIdAndDelete(id);

        res.json({
            message: 'Category Delete'
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};