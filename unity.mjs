import { buildSingle } from "./single.mjs";

buildSingle({
    outputFileName: "index.html",
    minifyHtml: true,
    deliveryTarget: "unity"
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
