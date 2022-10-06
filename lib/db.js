#!/usr/bin/env node
import AWS from 'aws-sdk';
import { $ } from 'zx';

export default class TAKServerDB {
    static async upgrade() {
        await $`java -jar ./db-utils/SchemaManager.jar upgrade`;
    }
}