// Modules
const awsIot = require('aws-iot-device-sdk');
const uuid = require('uuid');

// MQTT Broker specific configuration
const region = process.env.REGION || process.env.AWS_REGION || 'eu-west-1';
const host = process.env.HOST || new Error('MQTT Endpoint not defined'); // MQTT Endpoint
const caPath = process.env.ROOT || 'AmazonRootCA1.pem';

// Device specific configuration
const clientId = process.env.CLIENT_ID || new Error('Client Id not defined');
const keyPath = `${clientId}-private.pem.key`;
const certPath = `${clientId}-certificate.pem.crt`;
const stateMessageFrequency = 5000; // in milliseconds
const stateTopic = `sensors/temperature/${clientId}/state`;

// Device Class
const options = {
  //privateKey: new Buffer(key),
  //clientCert: new Buffer(cert),
  //caCert: new Buffer(mqttCertificatePem),
  keyPath,
  certPath,
  caPath,
  clientId,
  host,
  region,
  debug: false
};

let device;
try {
    device = awsIot.device(options);
} catch(e) {
    console.log(`[ERROR] ${e.message}`);
    console.log(`This seems not like a file path nor the the key file does not exist: ${keyPath}`);
    process.exit(1);
}


// Connect the device
device
  .on('connect', function() {
    console.log('[INFO] connected!');

    // Publishing device state
    sendState();
  });



// State sender
function sendState() {
  const state = {
    id: uuid.v4(),
    timestamp: new Date().getTime(),
    battery: Math.ceil(Math.random() * 100),
    temperature: Math.ceil(Math.random() * 100)
  };
  console.log(`[INFO] Sending device state to topic: ${stateTopic} with payload:\n`, JSON.stringify(state, null, 2));
  device.publish(stateTopic, JSON.stringify(state));
  return sleep(stateMessageFrequency).then(() => {
    return sendState();
  })
}


// Other event listeners
device.on('reconnect', () => {
  console.log('[DEBUG] Trying to reconnect!');
});
device.on('close', () => {
  console.log('[DEBUG] Connection closed!');
});
device.on('offline', () => {
  console.log('[DEBUG] We went offline!');
});
device.on('error', err => {
  console.log('[ERROR] Something went wrong: ', err);
});


// Helper functions
function sleep(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });
}