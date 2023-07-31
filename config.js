require('dotenv').config();
exports.PORT = process.env.PORT;
var DATABASEUSERNAME = process.env.DBUSER,
    DATABASEPASSWORD = process.env.DBPASSWORD,
    DATABASEHOST = process.env.DBHOST,
    DATABASENAME = (process.env.ENV === "LOCAL") ? process.env.DBNAME_STAGE : process.env.DBNAME;

exports.CONFIG = {
    CRON: "on",
    OPENSEA_API_KEY: process.env.OPENSEA_API_KEY,
    TWITTER_API_KEY: "Bearer AAAAAAAAAAAAAAAAAAAAAOYNbQEAAAAARnVjb10Ha8ORmwgR1Kd5xERiN90%3DWzoJioVJTEQCwpMOfHeWFoXB2VkcWd4R8o04IBS63gODIbaIGv"
}
exports.TWITTER_USER = ['1455734764221067266'];
exports.TOTAL_NFTS = 10000;
exports.dburl = `mongodb+srv://${DATABASEUSERNAME}:${DATABASEPASSWORD}@${DATABASEHOST}/${DATABASENAME}?tls=true&authSource=admin`;

