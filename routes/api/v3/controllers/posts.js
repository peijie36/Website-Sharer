import express from "express";
import session from "express-session";
let router = express.Router();

import getURLPreview from "../utils/urlPreviews.js";

const escapeHTML = (str) =>
    String(str).replace(
        /[&<>'"]/g,
        (tag) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;",
            }[tag])
    );

async function createPost(post) {
    let preview;
    try {
        preview = await getURLPreview(post["url"]);
    } catch (error) {
        preview = error;
    }
    return {
        username: escapeHTML(post["username"]),
        description: escapeHTML(post["description"]),
        id: post["_id"],
        likes: post["likes"],
        htmlPreview: preview,
        created_date: post["created_date"],
    };
}

router.post("/", async (req, res, next) => {
    if (req.session.isAuthenticated) {
        try {
            const newPost = new req.models.Post({
                url: req.body.url,
                username: req.session.account.username,
                description: req.body.description,
                created_date: Date.now(),
            });
            await newPost.save();
            res.json({ status: "success" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: "error", error: error });
        }
    } else {
        res.status(401).json({
            status: "error",
            error: "not logged in",
        });
    }
});

router.get("/:username?", async (req, res, next) => {
    if (req.query.username) {
        let userParam = req.query.username;
        try {
            let postPromise = await req.models.Post.find({
                username: userParam,
            });
            let allPosts = await Promise.all(
                postPromise.map(async (post) => {
                    return createPost(post);
                })
            );
            res.json(allPosts);
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: "error", error: error });
        }
    } else {
        try {
            let postPromise = await req.models.Post.find();
            let allPosts = await Promise.all(
                postPromise.map(async (post) => {
                    return createPost(post);
                })
            );
            res.json(allPosts);
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: "error", error: error });
        }
    }
});

router.post("/like", async (req, res, next) => {
    try {
        if (req.session.isAuthenticated) {
            let likedPostId = req.body.postID;
            let post = await req.models.Post.findById(likedPostId);
            if (!post["likes"].includes(req.session.account.username)) {
                post["likes"].push(req.session.account.username);
                await post.save();
            }
            res.json({ status: "success" });
        } else {
            res.status(401).json({
                status: "error",
                error: "not logged in",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", error: error });
    }
});

router.post("/unlike", async (req, res, next) => {
    try {
        if (req.session.isAuthenticated) {
            let likedPostId = req.body.postID;
            let post = await req.models.Post.findById(likedPostId);
            if (post["likes"].includes(req.session.account.username)) {
                post["likes"].remove(req.session.account.username);
                await post.save();
            }
            res.json({ status: "success" });
        } else {
            res.status(401).json({
                status: "error",
                error: "not logged in",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", error: error });
    }
});

// DELETE endpoint that lets user delete a post they created and all its comments
router.delete("/", async (req, res, next) => {
    try {
        if (req.session.isAuthenticated) {
            let likedPostId = req.body.postID;
            let post = await req.models.Post.findById(likedPostId);
            if (post.username == req.session.account.username) {
                // delete the post and its comments
                await req.models.Comment.deleteMany({ post: likedPostId });
                await req.models.Post.deleteOne({ _id: likedPostId });
                res.json({ status: "success" });
            } else {
                res.status(401).json({
                    status: "error",
                    error: "you can only delete your own posts",
                });
            }
        } else {
            res.status(401).json({
                status: "error",
                error: "not logged in",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", error: error });
    }
});

export default router;
