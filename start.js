#!/usr/bin/env node
import AWS from 'aws-sdk';

class TAKServer {
    constructor(bucket, stack_name) {
        this.bucket = bucket;
        this.stack_name = stack_name;
        this.config = null;
    }

    static async configure() {
        // These should be set automatically by the CF/ECS Service. If you are running locally for debugging, set manually
        if (!process.env.ConfigBucket) throw new Error('ConfigBucket ENV should contain S3 bucket name');
        if (!process.env.StackName) throw new Error('StackName ENV should contain CloudFormation Stack Name');

        const server = new TAKServer(process.env.ConfigBucket, process.env.StackName);

        const s3 = new AWS.S3({ region: process.env.AWS_DEFAULT_REGION || 'us-east-1' });

        const head = await s3.headObject({
            Bucket: process.env.ConfigBucket,
            Key: 'config.json'
        }).promise();

        console.error(head);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    TAKServer.configure();
}

