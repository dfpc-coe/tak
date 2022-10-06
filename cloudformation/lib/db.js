import cf from '@mapbox/cloudfriend';

export default {
    Parameters: {
        DatabaseType: {
            Type: 'String',
            Default: 'db.t3.micro',
            Description: 'Database size to create',
            AllowedValues: [
                'db.t3.micro',
                'db.t3.small',
                'db.t3.medium',
                'db.t3.large'
            ]
        }
    },
    Resources: {
        DBMasterSecret: {
            Type: 'AWS::SecretsManager::Secret',
            Properties: {
                Description: cf.join([cf.stackName, ' RDS Master Password']),
                GenerateSecretString: {
                    SecretStringTemplate: '{"username": "martiuser"}',
                    GenerateStringKey: 'password',
                    ExcludePunctuation: true,
                    PasswordLength: 32
                },
                Name: cf.join([cf.stackName, '/rds/secret']),
                KmsKeyId: cf.ref('KMS')
            }
        },
        DBMasterSecretAttachment: {
            Type: 'AWS::SecretsManager::SecretTargetAttachment',
            Properties: {
                SecretId: cf.ref('DBMasterSecret'),
                TargetId: cf.ref('DBInstanceVPC'),
                TargetType: 'AWS::RDS::DBInstance'
            }
        }
        DBInstanceVPC: {
            Type: 'AWS::RDS::DBInstance',
            Properties: {
                Engine: 'postgres',
                EnablePerformanceInsights: true,
                DBName: 'uploader',
                DBInstanceIdentifier: cf.stackName,
                KmsKeyId: cf.ref('KMS'),
                EngineVersion: '14.2',
                MasterUsername: cf.sub('{{resolve:secretsmanager:${AWS::StackName}/rds/secret:SecretString:username:AWSCURRENT}}'),
                MasterUserPassword: cf.sub('{{resolve:secretsmanager:${AWS::StackName}/rds/secret:SecretString:password:AWSCURRENT}}'),
                AllocatedStorage: 10,
                MaxAllocatedStorage: 100,
                BackupRetentionPeriod: 10,
                StorageType: 'gp2',
                StorageEncrypted: true,
                DBInstanceClass: cf.ref('DatabaseType'),
                VPCSecurityGroups: [cf.ref('DBVPCSecurityGroup')],
                DBSubnetGroupName: cf.ref('DBSubnet'),
                PubliclyAccessible: true
            }
        },
        DBVPCSecurityGroup: {
            Type: 'AWS::EC2::SecurityGroup',
            Properties: {
                GroupDescription: cf.join('-', [cf.stackName, 'rds-sg']),
                VpcId: cf.ref('VPC'),
                SecurityGroupIngress: [{
                    IpProtocol: '-1',
                    SourceSecurityGroupId: cf.getAtt('ServiceSecurityGroup', 'GroupId')
                },{
                    IpProtocol: '-1',
                    CidrIp: '0.0.0.0/0'
                }]
            }
        },
        DBSubnet: {
            Type: 'AWS::RDS::DBSubnetGroup',
            Properties: {
                DBSubnetGroupDescription: cf.join('-', [cf.stackName, 'rds-subnets']),
                SubnetIds: [
                    cf.ref('SubA'),
                    cf.ref('SubB')
                ]
            }
        }
    },
    Outputs: {
        DB: {
            Description: 'Postgres Connection String',
            Value: cf.join([
                'postgresql://uploader',
                ':',
                cf.ref('DatabasePassword'),
                '@',
                cf.getAtt('DBInstanceVPC', 'Endpoint.Address'),
                ':',
                cf.getAtt('DBInstanceVPC', 'Endpoint.Port'),
                '/uploader'
            ])
        }
    }
};
