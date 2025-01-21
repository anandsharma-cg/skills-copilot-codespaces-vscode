// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
app.use(bodyParser.json());

// Middleware to validate comment ID format
app.use('/comments/:id', (req, res, next) => {
    const id = req.params.id;
    if (!/^\d+$/.test(id)) {
        return res.status(400).json({ message: 'Invalid comment ID format' });
    }
    next();
});

// Read the file
const comments = require('./comments.json');

// Get all comments
app.get('/comments', (req, res) => {
    res.json(comments);
});

// Get a specific comment
app.get('/comments/:id', (req, res) => {
    const id = req.params.id;
    const comment = comments.find(comment => comment.id === id);
    if (comment) {
        res.json(comment);
    } else {
                res.status(404).json({ message: 'Comment not found' });
    }
});

// Create a new comment
app.post('/comments', (req, res) => {
    const newComment = req.body;
    if (!newComment.id || !newComment.author || !newComment.text) {
        return res.status(400).json({ message: 'Invalid comment data' });
    }
    const existingComment = comments.find(comment => comment.id === newComment.id);
    if (existingComment) {
        return res.status(400).json({ message: 'Comment ID already exists' });
    }
    comments.push(newComment);
    fs.writeFile('./comments.json', JSON.stringify(comments), (err) => {
        if (err) {
            res.status(500).json({ message: 'Error writing data' });
        } else {
            res.json(newComment);
        }
    });
});

// Update a comment
app.put('/comments/:id', (req, res) => {
    const id = req.params.id;
    const newComment = req.body;
    const comment = comments.find(comment => comment.id === id);
    if (comment) {
        comment.author = newComment.author;
        comment.text = newComment.text;
        fs.writeFile('./comments.json', JSON.stringify(comments), (err) => {
            if (err) {
                res.status(500).json({ message: 'Error writing data' });
            } else {
                res.json(comment);
            }
        });
    } else {
        res.status(404).json({ message: 'Comment not found' });
    }
});

// Delete a comment
app.delete('/comments/:id', (req, res) => {
    const id = req.params.id;
    const index = comments.findIndex(comment => comment.id === id);
    if (index !== -1) {
        comments.splice(index, 1);
        fs.writeFile('./comments.json', JSON.stringify(comments), (err) => {
            if (err) {
                res.status(500).json({ message: 'Error writing data' });
            } else {
                res.json({ message: 'Comment deleted' });
            }
        });
    } else {
        res.status(404).json({ message: 'Comment not found' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});