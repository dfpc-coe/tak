#!/usr/bin/env node
import AWS from 'aws-sdk';
import {  XMLParser, XMLBuilder } from 'fast-xml-parser';
import fs from 'fs/promises';

const parser = new XMLParser();
const builder = new XMLBuilder();

export default class TAKServerConfig {
    constructor(loc='../../CoreConfig.xml') {
        this.loc = new URL(loc, import.meta.url);
    }

    async postgres(connection) {
        let config = parser.parse(await fs.readFile(this.loc));

        console.error(config);

        await fs.writeFile(await fs.readFile(this.loc), builder.build(config));
    }
}
