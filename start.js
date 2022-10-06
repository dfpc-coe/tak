#!/usr/bin/env node
import AWS from 'aws-sdk';
import CP from 'child_process';

/**
 * @class
 *
 * @prop {String} bucket    - S3 Bucket for Config Objects
 * @prop {String} stack     - Cloudformation StackName
 */
class TAKServer {
    constructor(bucket, stack) {
        this.bucket = bucket;
        this.stack = stack;
        this.config = null;
    }

    static async configure() {
        // These should be set automatically by the CF/ECS Service. If you are running locally for debugging, set manually
        if (!process.env.ConfigBucket) throw new Error('ConfigBucket ENV should contain S3 bucket name');
        if (!process.env.StackName) throw new Error('StackName ENV should contain CloudFormation Stack Name');

        const server = new TAKServer(process.env.ConfigBucket, process.env.StackName);

        const nginx = CP.spawn('nginx');
        nginx.stdout.pipe(process.stdout);
        nginx.stderr.pipe(process.stderr);

        const s3 = new AWS.S3({ region: process.env.AWS_DEFAULT_REGION || 'us-east-1' });

        const head = await s3.headObject({
            Bucket: server.bucket,
            Key: `${server.stack}/config.json`
        }).promise();

        console.error(head);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    TAKServer.configure();
}

