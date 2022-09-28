import cf from '@mapbox/cloudfriend';
import alarms from '@openaddresses/batch-alarms';

import db from './lib/db.js';
import s3 from './lib/s3.js';
import api from './lib/api.js';
import kms from './lib/kms.js';
import vpc from './lib/vpc.js';
import secret from './lib/secret.js';

const base = {
    Parameters: {
        GitSha: {
            Type: 'String',
            Description: 'GitSha to Deploy'
        }
    }
};

export default cf.merge(
    base,
    s3,
    db,
    api,
    kms,
    vpc,
    secret,
    alarms({
        prefix: 'Tak',
        apache: cf.stackName,
        email: 'tak@ingalls.ca',
        cluster: cf.ref('ECSCluster'),
        service: cf.getAtt('Service', 'Name'),
        loadbalancer: cf.getAtt('ELB', 'LoadBalancerFullName'),
        targetgroup: cf.getAtt('TargetGroup', 'TargetGroupFullName')
    })
);
