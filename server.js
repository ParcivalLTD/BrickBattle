const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

app.get("/models", (req, res) => {
  const directory = path.join(__dirname, "resources/models");
  fs.readdir(directory, { withFileTypes: true }, (err, files) => {
    if (err) {
      res.status(500).send(`Error reading directory: ${err}`);
      return;
    }

    const models = [];
    files.forEach((file) => {
      if (file.isDirectory()) {
        const subDirectory = path.join(directory, file.name);
        fs.readdirSync(subDirectory).forEach((subFile) => {
          if (subFile.endsWith(".stl")) {
            const stlFilePath = path.join(subDirectory, subFile);
            models.push({ name: file.name, path: stlFilePath });
          }
        });
      }
    });

    res.json(models);
  });
});

app.listen(3000, () => console.log("Server listening on port 3000"));
