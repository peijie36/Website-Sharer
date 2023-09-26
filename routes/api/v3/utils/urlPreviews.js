import fetch from "node-fetch";
import parser from "node-html-parser";

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

async function getURLPreview(url) {
    try {
        // fetch html from query url
        let urlFetch = await fetch(url);
        // parse the url html page and get all meta tags
        let urlResponse = await urlFetch.text();
        let htmlPage = parser.parse(urlResponse);

        let metaTags = htmlPage.querySelectorAll("meta");
        let metaOgObject = {};
        // filter meta tags that contain open graph information (url, title, image, description)
        metaTags.forEach((metatag) => {
            let property = metatag.attributes.property;
            if (property && property.startsWith("og:")) {
                metaOgObject[property] = escapeHTML(metatag.attributes.content);
                console.log(metatag.attributes.content);
            }
        });
        // write the html string for the url that obtains its info
        let htmlResponse = `<div style="margin-top: 1.5rem; max-width: 300px; border: solid 1px; padding: 3px; text-align: center;">`; // get the url
        if (metaOgObject["og:url"]) {
            htmlResponse += `<a href="${metaOgObject["og:url"]}">`;
        } else {
            htmlResponse += `<a href="${url}">`;
        }
        // get the title
        let title = htmlPage.querySelector("title");
        if (metaOgObject["og:title"]) {
            htmlResponse += `<p><strong> ${metaOgObject["og:title"]} </strong></p>`;
        } else if (title.content) {
            htmlResponse += `<p><strong> ${title.content} </strong></p>`;
        } else {
            htmlResponse += `<p><strong> ${url} </strong></p>`;
        }
        // get the image
        if (metaOgObject["og:image"]) {
            htmlResponse += `<img src="${metaOgObject["og:image"]}" style="max-height: 200px; max-width: 270px;">`;
        }
        htmlResponse += `</a>`;
        if (metaOgObject["og:description"]) {
            htmlResponse += `<p align="left" style="padding-left: 1rem; padding-top: 0.7rem">${metaOgObject["og:description"]}</p>`;
        }
        //get the type of the html page
        if (metaOgObject["og:type"]) {
            htmlResponse += `<h6 style="margin-top: 1.5rem">Type: ${metaOgObject["og:type"]}</h6>`;
        }
        htmlResponse += `</div>`;
        // send the html output
        return htmlResponse;
    } catch (error) {
        return error;
    }
}

export default getURLPreview;
