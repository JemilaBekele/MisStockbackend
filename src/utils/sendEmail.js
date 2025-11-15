const transporter = require('./email-transporter');

const sendEmail = async ({ to, subject, text, html }) => {
  return transporter.sendMail({
    from: `"Your Company" <${transporter.options.auth.user}>`,
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendEmail;
