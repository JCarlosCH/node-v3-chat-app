import path from "node:path";
import * as url from "node:url";

import express from "express";

const { PORT } = process.env;

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const publicDirectoryPath = path.join(__dirname, "../public");

const app = express();

app.use(express.static(publicDirectoryPath));

app.listen(PORT, () => {
    console.log(`Server is up on port ${PORT}`);
});
