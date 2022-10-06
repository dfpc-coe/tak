#!/usr/bin/env node
import AWS from 'aws-sdk';
import { $ } from 'zx';
import Cert from './lib/certs.js';
import DB from './lib/db.js'
import User from './lib/user.js'
import fetch from 'node-fetch';

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

        //TODO:
        //- Get Root User Secret

        await Cert.root(server);

        await Cert.gen('server', 'takserver');
        await Cert.gen('client', 'default');

        await DB.upgrade();

        await server.start();

        await Cert.activate('default');

        // TODO Lookup Root User Password from secret!
        await User.password('root', 'Bugaboos2022!AlpineCl1mbing');
    }

    async start() {
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

        process.env.JDK_JAVA_OPTIONS="-Dloader.path=WEB-INF/lib-provided,WEB-INF/lib,WEB-INF/classes,file:lib/ -Djava.net.preferIPv4Stack=true -Djava.security.egd=file:/dev/./urandom -DIGNITE_UPDATE_NOTIFIER=false -DIGNITE_QUIET=false"

        $`java -Dspring.profiles.active=messaging,duplicatelogs -jar takserver.war&`;
        $`java -Dspring.profiles.active=api,duplicatelogs -jar takserver.war&`;

        do {
            await delay(1000)

            try {
                console.log('ok - checking server status...');
                const res = await fetch('http://127.0.0.1:8080/index.html');

                console.log(`ok - server returned: ${res.status}`);
                if (res.status === 200) break;
            } catch (err) {
                console.log(`ok - server returned error: ${err.message}`);
            }
        } while(true)

        console.log('ok - server started!');
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    await $`nginx`;

    process.env.STATE = process.env.STATE || 'default';
    process.env.CITY = process.env.STATE || 'default';
    process.env.ORGANIZATIONAL_UNIT = process.env.STATE || 'default';

    TAKServer.configure();
}
