import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    caption: {
        type: String,
        maxlength: 2200
    },
    media: [{
        type: {
            type: String,
            required: true
        },
        url: {
            type: String,   // yeh field add karo
            required: true
        }
    }],
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: {
            type: String,
            required: true,
            maxlength: 500
        }
    }],
    tags: [{
        type: String,
        lowercase: true
    }],
}, {
    timestamps: true
});


export const Post = mongoose.model('Post', postSchema);
