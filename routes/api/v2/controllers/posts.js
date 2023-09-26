import express from "express";
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

router.post("/", async (req, res, next) => {
    try {
        const newPost = new req.models.Post({
            url: req.body.url,
            username: req.body.username,
            description: req.body.description,
            created_date: Date.now(),
        });
        await newPost.save();
        res.json({ status: "success" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", error: error });
    }
});

router.get("/", async (req, res, next) => {
    try {
        let postPromise = await req.models.Post.find();
        let allPosts = await Promise.all(
            postPromise.map(async (post) => {
                let preview;
                try {
                    preview = await getURLPreview(post["url"]);
                } catch (error) {
                    preview = error;
                }
                return {
                    username: escapeHTML(post["username"]),
                    description: escapeHTML(post["description"]),
                    htmlPreview: preview,
                };
            })
        );
        res.json(allPosts);
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", error: error });
    }
});

export default router;
