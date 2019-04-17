'use strict';

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({
  region: process.env.REGION,
  apiVersion: '2012-08-10'
});

module.exports.getData = async (event, context) => {

  // Retrieve data from the table
  const params = {
    TableName: process.env.TABLE
  };
  const data = await docClient.scan(params).promise();


  // Transform the data to:
  // dataPoints = {
  //  "deviceId-xxx": [{
  //    id: ...,
  //    timestamp: ...,
  //    temperature: ...,
  //    battery: ...
  //  }, {...}]
  // }

  const dataPoints = {};
  data.Items.forEach( e => {
    // Check wether we have already an entry for the current device
    if (!Array.isArray(dataPoints[e.deviceId])) dataPoints[e.deviceId] = [];

    dataPoints[e.deviceId].push(e);
  });

  // Order events regarding their timestamp
  Object.values(dataPoints).forEach(e => e.sort((a, b) => a.timestamp - b.timestamp));

  // Limit to only last 15 data points
  Object.values(dataPoints).forEach(e => e.splice(0, e.length - 15));
  
  // Send response back
  const response = {
    statusCode: 200,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(dataPoints),
  };
  console.log('Response message: ', response);
  return response;
};
