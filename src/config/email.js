require('dotenv').config();

const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    secure: false,
    tls: {
        rejectUnauthorized: false
    }
};

module.exports = emailConfig;
