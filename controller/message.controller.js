import { Message } from "../models/Message.js";
import mongoose from "mongoose";

export const createMessage = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { receiverId } = req.params; 
        const { text } = req.body;

        if (!senderId || !receiverId || !text?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Sender ID, Receiver ID, and text are required"
            });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text: text.trim(),
            createdAt: new Date()
        });

        const savedMessage = await newMessage.save();
        console.log("💾 New message created:", savedMessage._id);

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: savedMessage
        });

    } catch (error) {
        console.error("❌ Error creating message:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

export const getMessageById = async (request, response) => {
    try {
        const { messageId } = request.params;

        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return response.status(400).json({
                success: false,
                message: "Invalid message ID"
            });
        }

        const message = await Message.findById(messageId)
            .populate('senderId', 'username email')
            .populate('receiverId', 'username email');

        if (!message) {
            return response.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        response.json({
            success: true,
            data: message
        });

    } catch (error) {
        console.error("❌ Error fetching message:", error);
        response.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

export const getMessage = async (req, res) => {
    try {
        const senderId = req.user._id; 
        const { receiverId } = req.params;

        if (!senderId || !receiverId) {
            return res.status(400).json({
                success: false,
                message: "Sender ID and Receiver ID are required"
            });
        }

        console.log(`📥 Fetching messages between ${senderId} and ${receiverId}`);

        const messages = await Message.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        })
            .populate('senderId', 'username email')
            .populate('receiverId', 'username email')
            .sort({ createdAt: 1 });

        console.log(`📋 Found ${messages.length} messages`);

        res.json({
            success: true,
            data: messages,
            count: messages.length
        });

    } catch (error) {
        console.error("❌ Error fetching messages:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

export const getChatHistory = async (request, response) => {
    try {
        const { senderId, receiverId } = request.params;
        const page = parseInt(request.query.page) || 1;
        const limit = parseInt(request.query.limit) || 20;
        const skip = (page - 1) * limit;

        const messages = await Message.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        })
            .populate('senderId', 'username email')
            .populate('receiverId', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalMessages = await Message.countDocuments({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        });

        const totalPages = Math.ceil(totalMessages / limit);

        response.json({
            success: true,
            data: messages.reverse(),
            pagination: {
                currentPage: page,
                totalPages,
                totalMessages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error("❌ Error fetching chat history:", error);
        response.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};