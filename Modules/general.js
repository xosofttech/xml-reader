exports.NOW = function () {
    nDate = new Date().toISOString('en-US', {
        timeZone: "UTC"
    });
    return nDate;
}

exports.parseDate = function (date) {
    newDate = new Date(date);

    month = newDate.getMonth() + 1;
    month = (month <= 9) ? "0" + month : month;

    date = newDate.getDate();
    date = (date <= 9) ? "0" + date : date;

    return newDate.getFullYear() + '-' + month + '-' + date;
}

exports.SendEmail = async function (Sender, Email, Subject, Emailtext) {
    let transporter = nodemailer.createTransport({
        host: Sender.emaildetail.host,
        port: Sender.emaildetail.port,
        secure: false, // true for 465, false for other ports
        auth: {
            user: Sender.emaildetail.key,
            pass: Sender.emaildetail.password
        },
    });
    try {
        let info = await transporter.sendMail({
            from: Sender.Title + ' <' + Sender.emaildetail.sendfrom + '>', // sender address
            to: Email,
            subject: Subject,
            html: Emailtext,
        });
    } catch (e) {
        console.log("Email Not Sent!!!");
        console.log("Error:" + e);
    }
    //console.log(info);
}

exports.GetDay = function (DateStr) {
    try {
        const data = new Date(DateStr);
        const day = data.getDay();
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return dayNames[day];
    } catch (e) {
        return "";
    }
}

exports.Empty = function (object) {
    return Object.keys(object).length === 0
}