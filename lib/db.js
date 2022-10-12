import { $ } from 'zx';

export default class TAKServerDB {
    static async upgrade() {
        await $`java -jar /opt/tak/db-utils/SchemaManager.jar upgrade`;
    }
}
