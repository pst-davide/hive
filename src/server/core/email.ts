import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'zimbra.altovicentino.net',
    port: 465,
    secure: true,
    auth: {
        user: 'guesttracker@pasubiotecnologia.it',
        pass: 'VS)Ce39k@89u!3'
    }
});