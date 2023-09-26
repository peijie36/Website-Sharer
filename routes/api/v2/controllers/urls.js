import express from "express";
var router = express.Router();

import getURLPreview from "../utils/urlPreviews.js";

router.get("/preview", async (req, res) => {
    try {
        let urlQuery = req.query.url;
        res.type("html");
        res.send(await getURLPreview(urlQuery));
    } catch (error) {
        res.status(500).json({ status: "error", error: error });
    }
});

export default router;
