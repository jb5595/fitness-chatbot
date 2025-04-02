Running locally instructions.

## Build App
npm run build
## Start app
npm start
## Expose public endpoint
ngrok http 3000
<img width="1037" alt="Screenshot 2025-03-26 at 2 22 41 PM" src="https://github.com/user-attachments/assets/8ebe3b42-44cc-439f-ae12-b2df95cbce19" />

[Navigate to twillio console messaging sandbox settings ](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn?frameUrl=%2Fconsole%2Fsms%2Fwhatsapp%2Flearn%3Fx-target-region%3Dus1)

<img width="1512" alt="Screenshot 2025-03-26 at 2 25 19 PM" src="https://github.com/user-attachments/assets/e03c2f91-0a8a-4bf1-b95b-8f9af1caf164" />
Copy paste forwarding url from ngrok but keep /sms path

Join sandbox and send message to number and you should start seeing requests get forwarded to app

<img width="1248" alt="Screenshot 2025-03-26 at 2 28 07 PM" src="https://github.com/user-attachments/assets/f56bcc9c-29ae-4fa2-9e7c-5523f8a1e28d" />


