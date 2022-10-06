#!/usr/bin/env node
import AWS from 'aws-sdk';
import { $ } from 'zx';
import Cert from './lib/certs.js';

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

        /*
        const s3 = new AWS.S3({ region: process.env.AWS_DEFAULT_REGION || 'us-east-1' });

        const head = await s3.headObject({
            Bucket: server.bucket,
            Key: `${server.stack}/config.json`
        }).promise();
        */

        await Cert.root(server);

        await Cert.gen('server', 'takserver');
        await Cert.gen('client', 'admin');

        await server.start();
    }

    async start() {
        process.env.JDK_JAVA_OPTIONS="-Dloader.path=WEB-INF/lib-provided,WEB-INF/lib,WEB-INF/classes,file:lib/ -Djava.net.preferIPv4Stack=true -Djava.security.egd=file:/dev/./urandom -DIGNITE_UPDATE_NOTIFIER=false -DIGNITE_QUIET=false"

        $`java -Dspring.profiles.active=messaging,duplicatelogs -jar takserver.war&`;
        $`java -Dspring.profiles.active=api,duplicatelogs -jar takserver.war&`;
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    await $`nginx`;

    process.env.STATE = process.env.STATE || 'default';
    process.env.CITY = process.env.STATE || 'default';
    process.env.ORGANIZATIONAL_UNIT = process.env.STATE || 'default';

    TAKServer.configure();
}

