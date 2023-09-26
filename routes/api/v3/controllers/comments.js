import express from "express";
import session from "express-session";
let router = express.Router();

// GET request - returns all the comments associated with a post ID
router.get("/:postID?", async (req, res, next) => {
    try {
        let postId = req.query.postID;
        let commentPromise = await req.models.Comment.find({ post: postId });
        let allComments = await Promise.all(
            commentPromise.map(async (comment) => {
                return {
                    _id: comment["_id"],
                    username: comment["username"],
                    comment: comment["comment"],
                    post: comment["post"],
                    created_date: comment["created_date"],
                };
            })
        );
        res.json(allComments);
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", error: error });
    }
});

// POST request - add a new comment (includes username and comment text) to a specific post
router.post("/", async (req, res, next) => {
    try {
        if (req.session.isAuthenticated) {
            const newComment = new req.models.Comment({
                username: req.session.account.username,
                comment: req.body.newComment,
                post: req.body.postID,
                created_date: Date.now(),
            });
            await newComment.save();
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

export default router;
