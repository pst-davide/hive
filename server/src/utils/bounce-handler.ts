import Imap from 'node-imap';
import {inspect} from 'util';
import nodemailer from 'nodemailer';

const imapConfig: any = {
  user: 'bounce@pasubiotecnologia.it',
  password: 'Nb:7#78t=5W:',
  host: 'zimbra.altovicentino.net',
  port: 993,
  tls: true
};

function openInbox(imap: Imap, cb: (err: Error | null, box: any) => void) {
  imap.openBox('INBOX', false, cb);
}

export function processBounceEmails() {
  const imap = new Imap(imapConfig);

  imap.once('ready', function () {
    openInbox(imap, function (err, box) {
      if (err) throw err;

      const f = imap.seq.fetch('1:*', { // Imposta range o cerca specifici messaggi
        bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
        struct: true
      });

      f.on('message', function (msg, seqno) {
        console.log('Message #%d', seqno);
        msg.on('body', function (stream, info) {
          let buffer = '';
          stream.on('data', function (chunk) {
            buffer += chunk.toString('utf8');
          });
          stream.once('end', function () {
            if (info.which === 'HEADER.FIELDS (FROM TO SUBJECT DATE)') {
              const header = Imap.parseHeader(buffer);
              console.log('Parsed header:', inspect(header));
            } else if (info.which === 'TEXT') {
              console.log('Body:', buffer);
              const failedEmailMatch = buffer.match(/Original-Recipient: rfc822;(.*)/);
              const diagnosticCodeMatch = buffer.match(/Diagnostic-Code: (.*)/);

              if (failedEmailMatch) {
                console.log('Failed email:', failedEmailMatch[1].trim());
              }

              if (diagnosticCodeMatch) {
                console.log('Diagnostic Code:', diagnosticCodeMatch[1].trim());
              }
            }
          });
        });
      });

      f.once('error', function (err) {
        console.log('Fetch error: ' + err);
      });

      f.once('end', function () {
        console.log('Done fetching all messages!');
        imap.end();
      });
    });
  });

  imap.once('error', function (err) {
    console.log(err);
  });

  imap.once('end', function () {
    console.log('Connection ended');
  });

  imap.connect();
}

processBounceEmails();
