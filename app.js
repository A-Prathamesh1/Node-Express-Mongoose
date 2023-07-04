console.log('this is awesome');
import express from 'express';
import mongoose from 'mongoose';
import axios from 'axios';

const { Schema } = mongoose;

const postsSchema = new Schema({
        userId: Number,
        id: Number,
        title: String,
        body: String,
});

const Post = mongoose.model('Post', postsSchema);

mongoose.connect('mongodb://127.0.0.1:27017/entries');

const app = express();
app.use(express.json());

app.get('/posts/populate', async (req, res) => {
        try {
                const response = await axios.get(
                        'https://jsonplaceholder.typicode.com/posts'
                );
                const posts = response.data;

                // Clear the existing data in the collection
                await Post.deleteMany({});

                // Insert the fetched posts into the collection
                await Post.insertMany(posts);

                res.status(200).json({
                        message: 'Data populated successfully',
                });
        } catch (error) {
                res.status(500).json({
                        error: 'An error occurred while populating data',
                });
        }
});

// Get all posts
app.get('/posts', async (req, res) => {
        try {
                const posts = await Post.find();
                res.status(200).json(posts);
        } catch (error) {
                res.status(500).json({
                        error: 'An error occurred while fetching posts',
                });
        }
});

// Get a single post by ID
app.get('/posts/:id', async (req, res) => {
        const postId = req.params.id;
        try {
                const post = await Post.findById(postId);
                if (!post) {
                        return res
                                .status(404)
                                .json({ error: 'Post not found' });
                }
                res.status(200).json(post);
        } catch (error) {
                res.status(500).json({
                        error: 'An error occurred while fetching the post',
                });
        }
});

app.post('/posts', async (req, res) => {
        const { userId, id, title, body } = req.body;

        try {
                const newPost = new Post({ userId, id, title, body });
                const savedPost = await newPost.save();
                res.status(201).json(savedPost);
        } catch (error) {
                res.status(500).json({
                        error: 'An error occurred while creating the post',
                });
        }
});

// Update an existing post
app.put('/posts/:id', async (req, res) => {
        const postId = req.params.id;
        const { userId, id, title, body } = req.body;
        try {
                const updatedPost = await Post.findByIdAndUpdate(
                        postId,
                        { userId, id, title, body },
                        { new: true }
                );
                if (!updatedPost) {
                        return res
                                .status(404)
                                .json({ error: 'Post not found' });
                }
                res.status(200).json(updatedPost);
        } catch (error) {
                res.status(500).json({
                        error: 'An error occurred while updating the post',
                });
        }
});

// Delete a post
app.delete('/posts/:id', async (req, res) => {
        const postId = req.params.id;
        try {
                const deletedPost = await Post.findByIdAndDelete(postId);
                if (!deletedPost) {
                        return res
                                .status(404)
                                .json({ error: 'Post not found' });
                }
                res.status(200).json({ message: 'Post deleted successfully' });
        } catch (error) {
                res.status(500).json({
                        error: 'An error occurred while deleting the post',
                });
        }
});

app.use(function (error, req, res, next) {
        // Default error handling function
        // Will become active whenever any route / middleware crashes
        console.log(error);
        res.status(500);
});

app.listen(3000, () => {
        console.log('Server has started at port 3000');
});
