import express from "express";
import fetch from "node-fetch";
import parser from "node-html-parser";
let router = express.Router();

router.get("/urls/preview", async (req, res) => {
    let urlQuery = req.query.url;

    // fetch html from query url
    let url = await fetch(urlQuery);

    // parse the url html page and get all meta tags
    let htmlPage;
    try {
        let urlResponse = await url.text();
        htmlPage = parser.parse(urlResponse);
    } catch (error) {
        res.send(error);
    }
    let metaTags = htmlPage.querySelectorAll("meta");
    let title = htmlPage.querySelector("title");
    let metaOgObject = {};

    // filter meta tags that contain open graph information (url, title, image, description)
    metaTags.forEach((metatag) => {
        let property = metatag.attributes.property;
        if (property && property.startsWith("og:")) {
            metaOgObject[property] = metatag.attributes.content;
        }
    });

    // write the html string for the url that obtains its info
    let htmlResponse = `<div style="margin-top: 1.5rem; max-width: 300px; border: solid 1px; padding: 3px; text-align: center;">`;
    // get the url
    if (metaOgObject["og:url"]) {
        htmlResponse += `<a href="${metaOgObject["og:url"]}">`;
    } else {
        htmlResponse += `<a href="${urlQuery}">`;
    }
    // get the title
    if (metaOgObject["og:title"]) {
        htmlResponse += `<p><strong> ${metaOgObject["og:title"]} </strong></p>`;
    } else if (title) {
        htmlResponse += `<p><strong> ${title} </strong></p>`;
    } else {
        htmlResponse += `<p><strong> ${urlQuery} </strong></p>`;
    }
    if (metaOgObject["og:image"]) {
        htmlResponse += `<img src="${metaOgObject["og:image"]}" style="max-height: 200px; max-width: 270px;">`;
    }
    htmlResponse += `</a>`;
    if (metaOgObject["og:description"]) {
        htmlResponse += `<p align="left" style="padding-left: 1rem; padding-top: 0.7rem">${metaOgObject["og:description"]}</p>`;
    }
    htmlResponse += `<h6 style="margin-top: 1.5rem">Type: ${metaOgObject["og:type"]}</h6>`;
    htmlResponse += `</div>`;

    // send the html output
    res.type("html");
    res.send(htmlResponse);
});

export default router;
