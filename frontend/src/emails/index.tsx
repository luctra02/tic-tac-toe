export default function generateVerifyEmailTemplate(otp: string): string {
    return `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
              color: #333;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #ffffff;
              border: 1px solid #ddd;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #4CAF50;
              font-size: 24px;
              text-align: center;
            }
            p {
              margin: 10px 0;
              font-size: 16px;
            }
            .otp {
              font-size: 20px;
              font-weight: bold;
              color: #ff5722;
              text-align: center;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              text-align: center;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Verify Your Email</h1>
            <p>To verify your email address, use the following code:</p>
            <p class="otp">${otp}</p>
            <p>If you did not request this, please ignore this email.</p>
            <div class="footer">Thank you for using our service!</div>
          </div>
        </body>
      </html>
    `;
}
