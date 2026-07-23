import { buildSingle } from "./single.mjs";

buildSingle({
    outputFileName: "index.html",
    minifyHtml: true
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
