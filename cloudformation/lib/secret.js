import cf from '@mapbox/cloudfriend';

export default {
    Resources: {
        RootSecret: {
            Type: 'AWS::SecretsManager::Secret',
            Properties: {
                Description: cf.join([cf.stackName, ' Root User']),
                GenerateSecretString: {
                    SecretStringTemplate: '{"username": "root"}',
                    GenerateStringKey: 'password',
                    ExcludePunctuation: true,
                    PasswordLength: 32
                },
                Name: cf.join([cf.stackName, '/user/root']),
                KmsKeyId: cf.ref('KMS')
            }
        },
    }
};
