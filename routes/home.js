import express from "express";
import fs from "fs";
import bodyParser from "body-parser";


const router = express.Router();

const app = express()
app.use(bodyParser.json());
app.set('view engine','ejs');
app.set('views', './views');


router.get("/", (req, res) => {
    res.render("home");
});

export default router;