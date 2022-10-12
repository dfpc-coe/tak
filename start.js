#!/usr/bin/env node
import AWS from 'aws-sdk';
import { $ } from 'zx';
import Cert from './lib/certs.js';
import DB from './lib/db.js'
import User from './lib/user.js'
import Config from './lib/config.js';
import fetch from 'node-fetch';
import fs from 'fs/promises';

/**
 * @class
 *
 * @prop {boolean}  is_local    - Is the Server being run on an AWS environment (false) or locally (true)
 * @prop {String}   bucket      - S3 Bucket for Config Objects
 * @prop {String}   stack       - Cloudformation StackName
 */
class TAKServer {
    constructor(bucket, stack) {
        this.is_local = stack === 'local';

        this.bucket = bucket;
        this.stack = stack;

        this.config = new Config();
    }

    // TODO env vars should come in here as config object
    static async configure() {
        // These should be set automatically by the CF/ECS Service. If you are running locally for debugging, set manually
        if (process.env.StackName !== 'local' && !process.env.ConfigBucket) throw new Error('ConfigBucket ENV should contain S3 bucket name');
        if (!process.env.POSTGRES) throw new Error('POSTGRES ENV should contain S3 bucket name');
        if (!process.env.StackName) throw new Error('StackName ENV should contain CloudFormation Stack Name');

        const server = new TAKServer(process.env.ConfigBucket, process.env.StackName);

        await server.config.postgres(process.env.POSTGRES);

        try {
            await fs.access('/opt/tak/certs/files/ca.crl');
        } catch (err) {
            await Cert.root(server);
        }

        try {
            await fs.access('/opt/tak/certs/files/default.csr');
        } catch (err) {
            await Cert.gen('client', 'default');
        }

        try {
            await fs.access('/opt/tak/certs/files/takserver.csr');
        } catch (err) {
            await Cert.gen('server', 'takserver');
        }

        await DB.upgrade();

        await server.start();

        await Cert.activate('default');

        if (server.is_local) {
            await User.password('root', 'Bugaboos2022!AlpineCl1mbing');
        } else {
            const secrets = new AWS.SecretsManager({ region: process.env.AWS_DEFAULT_REGION || 'us-east-1' });

            const root = secrets.getSecretValue({
                SecretId: `${server.stack}-root`
            });

            await User.password('root', root.password);
        }
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
    try {
        console.log('ok - checking nginx status...');
        const res = await fetch('http://127.0.0.1:8081/healthy');
        console.log(`ok - server returned: ${res.status}`);
        if (res.status !== 200) throw new Error('nginx not running');
    } catch (err) {
        await $`nginx`;
    }

    process.env.StackName = process.env.StackName || 'local';
    process.env.STATE = process.env.STATE || 'default';
    process.env.CITY = process.env.STATE || 'default';
    process.env.ORGANIZATIONAL_UNIT = process.env.STATE || 'default';
    process.env.POSTGRES = process.env.POSTGRES || 'postgres://martiuser:local123@postgis:5432/cot';

    TAKServer.configure();
}
