require("dotenv").config();
const nodemailer = require("nodemailer");

const { NOTIFICATIONS_EMAIL_ADDRESS, NOTIFICATIONS_EMAIL_PASSWORD } = process.env;

async function sendCustomMail(req, res) {
  try {
    // Email transport config
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: NOTIFICATIONS_EMAIL_ADDRESS,
            pass: NOTIFICATIONS_EMAIL_PASSWORD
        }
    });

    // Email message config
    const mailOptions = {
        from: NOTIFICATIONS_EMAIL_ADDRESS,
        to: "abdoulanzizally@outlook.com",
        subject: `COIRE CASH SYSTEM MAIL`,
        html: `
            <h2>Close of Day Financial Records</h2>
            <div>
                <div>
                    <h3>Income:</h3>
                    <h4>UGX 1,400,000</h4>
                </div>
                <div>
                    <h3>Expenses:</h3>
                    <h4>UGX 120,000</h4>
                </div>
            </div>
        `
    }

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if(error){
            console.log("Error..", error);
            res.send("Some error occurred!");
        }else{
            console.log("Success..");
            res.send("Success!");
        }
    });
  } catch (error) {
    console.error('Error sending mail:', error);
  }
}

async function sendCloseOfDayFinancialSummaries(req, res) {
  try {
    // Email transport config
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: NOTIFICATIONS_EMAIL_ADDRESS,
            pass: NOTIFICATIONS_EMAIL_PASSWORD
        }
    });

    // Email message config
    const mailOptions = {
        from: NOTIFICATIONS_EMAIL_ADDRESS,
        to: "abdoulanzizally@outlook.com",
        subject: `COIRE CASH SYSTEM MAIL`,
        html: `
            <h2>Close of Day Financial Records</h2>
            <div>
                <div>
                    <h3>Income:</h3>
                    <h4>UGX 1,400,000</h4>
                </div>
                <div>
                    <h3>Expenses:</h3>
                    <h4>UGX 120,000</h4>
                </div>
            </div>
        `
    }

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if(error){
            console.log("Error..", error);
            res.send("Some error occurred!");
        }else{
            console.log("Success..");
            res.send("Success!");
        }
    });
  } catch (error) {
    console.error('Error sending mail:', error);
  }
}

module.exports = {sendCustomMail, sendCloseOfDayFinancialSummaries};