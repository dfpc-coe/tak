#!/usr/bin/env node
import AWS from 'aws-sdk';
import { $ } from 'zx';

export default class TAKServerUser {
    static async password(user, password) {
        await $`java -jar /opts/tak/utils/UserManager.jar usermod -A -p ${password} ${user}`;
    }

    static async cert() {
        await $`java -jar utils/UserManager.jar certmod -A certs/files/admin.pem`;
    }
}
