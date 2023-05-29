const fs = require('fs');
const https = require('https'); // or 'https' for https:// URLs

const DataDir = "public";
if (!fs.existsSync(DataDir)) {
    fs.mkdirSync(DataDir);
}

const file = fs.createWriteStream(`${DataDir}/shows.xml`);
const request = https.get("https://buytickets.kartisim.co.il/xml/partner/shows.xml", function (response) {
    response.pipe(file);
    // after download completed close filestream
    file.on("finish", () => {
        file.close();
        console.log("Download Completed");
    });
});