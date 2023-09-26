import express from "express";
import session from "express-session";
let router = express.Router();

router.get("/myIdentity", function (req, res, next) {
    if (req.session.isAuthenticated) {
        res.json({
            status: "loggedin",
            userInfo: {
                name: req.session.account.name,
                username: req.session.account.username,
            },
        });
    } else {
        res.json({ status: "loggedout" });
    }
});

router.post("/userInfo", async (req, res, next) => {
    try {
        if (req.session.isAuthenticated) {
            let about = req.body.userBio;
            let username = req.session.account.username;
            let userInfo = await req.models.userInfo.findOne({
                username: username,
            });
            if (userInfo) {
                userInfo["userBio"] = about;
                await userInfo.save();
            } else {
                const newUserInfo = new req.models.userInfo({
                    username: username,
                    userBio: about,
                });
                await newUserInfo.save();
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

router.get("/userInfo/:username?", async (req, res, next) => {
    try {
        let username = req.query.username;
        let userInfoPromise = await req.models.userInfo.find({
            username: username,
        });
        let userInfo = await Promise.all(
            userInfoPromise.map(async (userInfo) => {
                return {
                    username: userInfo.username,
                    userBio: userInfo.userBio,
                };
            })
        );
        res.json(userInfo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", error: error });
    }
});

export default router;
