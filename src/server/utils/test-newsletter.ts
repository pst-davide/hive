import {processQueue, sendToQueue} from './email';

const emailList = ['davide.sorrentino@gmail.com', 'davide.sorrentino@gmail.com', 'davide.sorrentino@gmail.com'];
const createTestEmail = (index: number) => ({
  to: emailList[index],
  subject: `Test Email ${index}`,
  text: `This is a test email number ${index}.`
});

async function sendTestEmails() {
  for (let i = 0; i <= 2; i++) {
    const emailData = createTestEmail(i);
    await sendToQueue(emailData);
    console.log(`Email ${i} inviata alla coda.`);
  }
}

sendTestEmails().then(() => {
  processQueue().then(() => {});
})


