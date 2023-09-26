import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import models from "./models.js";
import sessions from "express-session";
import msIdExpress from "microsoft-identity-express";
const appSettings = {
    appCredentials: {
        clientId: "2c4df4d3-03a4-428c-baec-d2d44c6de277",
        tenantId: "f6b6dd5b-f02f-441a-99a0-162ac5060bd2",
        clientSecret: "NUM8Q~KBOwvuP7In3EDtpAhBxcseIZyQwre4Ybn4",
    },
    authRoutes: {
        redirect: "https://www.peijiewebsharer.me/redirect",
        //redirect: "http://localhost:3000/redirect",
        error: "/error", // the wrapper will redirect to this route in case of any error.
        unauthorized: "/unauthorized", // the wrapper will redirect to this route in case of unauthorized access attempt.
    },
};

import apiv1Router from "./routes/api/v1/apiv1.js";
import apiv2Router from "./routes/api/v2/apiv2.js";
import apiv3Router from "./routes/api/v3/apiv3.js";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const oneDay = 1000 * 60 * 60 * 24;
app.use(
    sessions({
        secret: "this is some secret key I am making up 09532poi fn4eelhu jfcbds",
        saveUninitialized: true,
        cookie: { maxAge: oneDay },
        resave: false,
    })
);

const msid = new msIdExpress.WebAppAuthClientBuilder(appSettings).build();
app.use(msid.initialize());

app.use((req, res, next) => {
    req.models = models;
    next();
});

app.use("/api/v1", apiv1Router);
app.use("/api/v2", apiv2Router);
app.use("/api/v3", apiv3Router);

app.get("/signin", msid.signIn({ postLoginRedirect: "/" }));

app.get("/signout", msid.signOut({ postLogoutRedirect: "/" }));

app.get("/error", (req, res) => {
    res.status(500).send("Error: Server error");
});

app.get("/unauthorized", (req, res) => {
    res.status(401).send("Error: Permission denied");
});

export default app;
