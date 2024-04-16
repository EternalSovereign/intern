const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const logEvents = async (message, logFileName) => {
    const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

    try {
        if (!fs.existsSync(path.join(__dirname, "../logs"))) {
            await fsPromises.mkdir(path.join(__dirname, "../logs"));
        }
        await fsPromises.appendFile(
            path.join(__dirname, `../logs/${logFileName}`),
            logItem
        );
    } catch (error) {
        console.log(error);
    }
};

const logger = (req, res, next) => {
    let logFileName = "reqLog.log";
    const oldSend = res.send;

    res.send = function (data) {
        const response = JSON.parse(data);
        const message = ` Respone: ${res.statusCode}\t\t${response.message}\n`;
        logEvents(message, logFileName);
        oldSend.apply(res, arguments);
    };
    const message = `Request: ${req.method}\t${req.url}`;
    logEvents(message, logFileName);
    next();
};

module.exports = { logger, logEvents };
