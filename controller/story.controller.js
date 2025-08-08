import { Story } from "../models/Story.js";
import fs from "fs";


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
            .populate({
                path: 'author',
                select: 'name email username profile',
                populate: {
                    path: 'profile'
                }
            });
            
        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }
        
        res.status(200).json(story);
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const createStory = async (req, res) => {
    try {
        const { type, duration } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // console.log("File saved at:", req.file.path);
        // console.log("File exists:", fs.existsSync(req.file.path));
        // console.log("Filename:", req.file.filename);

        const filePath = `/uploads/story/${req.file.filename}`;

        const story = new Story({
            author: req.user._id,
            media: {
                type,
                duration: duration || 15,
                url: filePath
            }
        });

        const saved = await story.save();
        res.status(201).json({ message: "Story created", story: saved });

    } catch (err) {
        console.error("Error:", err.message);
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
