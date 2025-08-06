import { Story } from "../models/Story.js";


export const getAllStories = async (req, res) => {
    try {
        const stories = await Story.find({
            expiresAt: { $gt: new Date() }
        }).populate("author", "name email");

        res.status(200).json(stories);
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getStoryById = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id)
            .populate("author", "name email")
            .populate("viewers.user", "name email");

        if (!story) return res.status(404).json({ error: "Story not found" });

        res.status(200).json(story);
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Internal server error" });
    }
};

export const createStory = async (req, res) => {
    try {
        const { type, duration } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = `/uploads/${req.file.filename}`;

        const story = new Story({
            author: req.user._id,
            media: {
                type,
                url: filePath,
                duration: duration || 15
            }
        });

        const saved = await story.save();
        res.status(201).json({ message: "Story created", story: saved });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const deleteStory = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ error: "Story not found" });

        await story.deleteOne();
        res.status(200).json({ message: "Story deleted" });

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getStoriesByUser = async (req, res) => {
    try {
        const stories = await Story.find({
            author: req.params.id,
            expiresAt: { $gt: new Date() }
        });

        res.status(200).json(stories);
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Internal server error" });
    }
};
