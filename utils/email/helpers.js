function generateEmailHtmlContent(processName, otp, otp_message) {
  const OTP_EXP_TIME = process.env.OTP_EXP_TIME || 5; // Default to 5 minutes if not set
  let htmlContent = "";
  switch (processName) {
    case "register":
      htmlContent = `
            <div style="font-family: sans-serif; text-align: center;">
            <h2>Welcome to IYAKSARL online shopping!</h2>
            <p>Please use the verification code below to complete your registration:</p>
            <h1 style="color: #2563eb; letter-spacing: 5px;">${otp}</h1>
            <p>This code will expire in ${OTP_EXP_TIME} minutes.</p>
          </div>
          `;
      break;
    case "login":
      htmlContent = `
        <div style="font-family: sans-serif; text-align: center;">
            <h2>We have detected a request to log in to IYAKSARL online shopping account!</h2>
            <p>Use the verification code below to complete login:</p>
            <h1 style="color: #2563eb; letter-spacing: 5px;">${otp}</h1>
            <p>This code will expire in ${OTP_EXP_TIME} minutes.</p>
        </div>
        `;
      break;
    case "auth_current":
      if (!otp_message) {
        throw new Error("Missing otp_message for auth_current process!");
      }
      htmlContent = `
        <div style="font-family: sans-serif; text-align: center;">
            <h2>${otp_message}</h2>
            <p>Use the verification code below to proceed with email switching:</p>
            <h1 style="color: #2563eb; letter-spacing: 5px;">${otp}</h1>
            <p>This code will expire in ${OTP_EXP_TIME} minutes.</p>
        </div>
          `;
      break;
    case "auth_new":
      if (!otp_message) {
        throw new Error("Missing otp_message for auth_new process!");
      }
      htmlContent = `
        <div style="font-family: sans-serif; text-align: center;">
            <h2>${otp_message}</h2>
            <p>Use the verification code below to proceed with email switching:</p>
            <h1 style="color: #2563eb; letter-spacing: 5px;">${otp}</h1>
            <p>This code will expire in ${OTP_EXP_TIME} minutes.</p>
        </div>
      `;
      break;
    default:
      throw new Error("Invalid process for generating email content!");
  }
  return htmlContent;
}

module.exports = { generateEmailHtmlContent };
