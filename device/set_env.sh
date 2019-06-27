#!/bin/bash
#
# Simple script to create and retrieve certificate/keys and
# iot endpoint from AWS IOT Core service and AWS Root CA
#
# Author: Facundo Ferrer
#

if [ $# != 2 ]
then
    echo
    echo "ERROR! Wrong arguments received: source set_env.sh $@"
    echo
    echo "Usage:"
    echo "  source set_env.sh <aws region to use> <client id>"
    return 1
fi

export REGION=$1
export CLIENT_ID=$2

key_file=$CLIENT_ID-private.pem.key
crt_file=$CLIENT_ID-certificate.pem.crt

echo " - Creating and retrieving a new certificate with client id: $CLIENT_ID"
certificate_id=$(aws iot create-keys-and-certificate --set-as-active --certificate-pem-outfile $crt_file --private-key-outfile $key_file --region $REGION --output text | head -n1 | awk '{print $2}')
echo "   * Certificate Id: $certificate_id"
echo $certificate_id >> cert_list

echo -n " - Retrieving AWS IOT Endpoint: "
export HOST=$(aws iot describe-endpoint  --endpoint-type iot:Data-ATS --output text --region $REGION)
echo $HOST

export ROOT=AmazonRootCA1.pem
echo " - Retrieving AWS Root CA: $ROOT"
if [ -f $ROOT ]
then
  curl -s https://www.amazontrust.com/repository/AmazonRootCA1.pem -o $ROOT
fi