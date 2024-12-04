const express = require("express");
const app = express();
const multer = require("multer");
const { sliceModel } = require("./slice");
const path = require("path");
require("dotenv").config();
const { dirname } = require("path");
const appDir = dirname(require.main.filename);

app.use(express.urlencoded({ extended: false, limit: "50mb" }));

const PORT = process.env.PORT || 3000;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `${appDir}/uploads`);
    },
    filename: (req, file, cb) => {
        var filename = file.originalname.replace(/ /g, "_");
        
        cb(null, Date.now() + "-" + filename);
    },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
    res.send("hi");
});

app.post("/slice", upload.single("uploaded_file"), (req, res) => {
    sliceModel(req.file.filename).then(x => {
        console.log(`Received ${req.file.filename} (${req.file.size} bytes): ${x['duration']} - ${x['distance']}mm`)
        res.json(x)
    });
});

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
});
