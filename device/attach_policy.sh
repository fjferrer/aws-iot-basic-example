#!/bin/bash
#
# Simple script to attach a policy to a list of certificates in a file
#
# Author: Facundo Ferrer
#

if [ $# != 2 ]
then
    echo
    echo "ERROR! Wrong arguments received: $(basename $0) $@"
    echo
    echo "Usage:"
    echo "  $0 <certificates file> <policy name>"
    exit 1
fi

cert_file=$1
policy_name=$2

echo " - Attaching policy $policy_name to certificates:"
for cert in `cat $cert_file`
do
	echo "  * Certficate Id: ${cert:(-64)}"
	aws iot attach-policy --policy-name $policy_name --target $cert
done
