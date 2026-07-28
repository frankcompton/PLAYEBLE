import { buildSingle } from "./single.mjs";

buildSingle({
    outputFileName: "index.html",
    minifyHtml: true,
    deliveryTarget: "unity",
    includeMraidScript: true
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
