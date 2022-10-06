#!/usr/bin/env node
import AWS from 'aws-sdk';
import { $ } from 'zx';

export default class TAKServerCert {
    static async root(server) {
        await $`cd /opt/tak/certs && ./makeRootCa.sh --ca-name ${server.stack}`;
    }

    static async gen(type, name) {
        await $`cd /opt/tak/certs && ./makeCert.sh.sh ${type} ${name}`;
    }
}
