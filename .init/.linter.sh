#!/bin/bash
cd /home/kavia/workspace/code-generation/insurance-claim-fraud-detection-platform-3119/insurance_fraud_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

