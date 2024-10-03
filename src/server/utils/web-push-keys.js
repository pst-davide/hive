const webPush = require('web-push');
const vapidKeys = webPush.generateVAPIDKeys();

console.log(vapidKeys);

// publicKey: 'BNoxscD2qZ71bMDlSu0bYaWMODSCaShPVqGlYxF03iLT_LkqrVveen2gnOJwaqDBkSx_K6UAigGCVfSoI13d9vE',
// privateKey: '3OSEg8Q_yCEKBlSTTz-rOiIYKdpo0lVrAXKnh4Su6Es'
