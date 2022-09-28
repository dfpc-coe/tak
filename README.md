<h1 align=center>TAK Cloudformation</h1>

<p align=center>Deploy TAK into an AWS Account via Cloudformation</p>

## Local

Local testing can be accomplished by using the provided docker compose functionality.

### First Run

The first time the repo is setup, the TAK server must be built from source for use in the Server Dockerfile.

```sh
./build/build
```

Once completed, this will create the following file:

```sh
./build/distributions/takserver.rpm
```

This process only needs to be re-run if the TAK Server version is updated.

### Subsequent Runs

```sh
docker-compose up

```

## Deployment

Deployment to AWS is handled via AWS Cloudformation. The template can be found in the `./cloudformation`
directory.

There are two methods to deploy the stack, either via [Deploy](https://github.com/openaddresses/deploy). Alternatively,
or via a generic Cloudformation JSON.

The Cloudformation JSON can be generated via:

```sh
npx deploy json
```
and then deployed via the AWS CLI or AWS Console UI.

It is highly recommended however to use the deploy tool over this method as Parameters, existance of
ECS/Docker resources, & S3 access are not provided by the default AWS Cloudformation deploy experience
and must be checked manually before a deployment can succeed.

Deploy comes pre-installed in the reposity and can be run via:
```sh
npx deploy
```

To install it globally - view the deploy [README](https://github.com/openaddresses/deploy)

Deploy uses your existing devseed AWS credentials. Ensure that your `~/.aws/credentials`
file looks like:
```
[tak]
aws_access_key_id = <redacted>
aws_secret_access_key = <redacted>
```

Then run

```sh
npx deploy init
```

To configure the tool.

Initial deployment can then done via:

```
npx deploy create <stackname>
```

and subsequent deployments can be down via:

```
npx deploy update <stackname>
```

