import { $ } from 'zx';

export default class TAKServerUser {
    static async password(user, password) {
        await $`java -jar /opt/tak/utils/UserManager.jar usermod -A -p ${password} ${user}`;
    }
}
