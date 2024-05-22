const express = require("express");

// Correctly require dotenv and use the .env.local file
require("dotenv").config({ path: "/.env.local", override: true });
const { DAO } = require("../DAO.js");

const app = express();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Origin", "https://localhost:3000");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.get("/demo", async (req, res) => {
    console.log("db operations...");
    const dbCredentials = {
        host: process.env.HOST,
        port: process.env.PORT,
        database: process.env.DATABASE,
        username: process.env.USERNAME,
        password: process.env.PASSWORD
    };
    const dao = new DAO(dbCredentials);
    dao.printCredentials();
    const idEmilyRoss = 1;
    const rows = await dao.executeQuery("select id, name from app.animals where id=$1", [idEmilyRoss]);
    console.log("rows:", rows)
    res.json({ rows_count: rows.length, first_row: rows.length > 0 ? rows[0] : null });
});

app.listen(3001);

