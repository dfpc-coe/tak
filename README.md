<h1 align=center>TAK Cloudformation</h1>

<p align=center>Deploy TAK into an AWS Account via Cloudformation</p>

## Deployment

### Deployment Tools

Deployment to AWS is handled via AWS Cloudformation. The template can be found in the `./cloudformation`
directory.

There are two methods to deploy the stack, either via [Deploy](https://github.com/openaddresses/deploy) or via a compiled
cloudformation template.

Deploy comes pre-installed in the repository and can be run via:
```sh
npx deploy
```

Deploy can also be installed globally by following the install instructions in the [README](https://github.com/openaddresses/deploy)


Deploy uses your existing AWS credentials. Ensure that your `~/.aws/credentials` file contains an entry
like the following:

```
[tak]
aws_access_key_id = <redacted>
aws_secret_access_key = <redacted>
```

Once an entry for `[tak]` is confirmed or added, run

```sh
npx deploy init
```

for initial configuration of the tool (This need only be performed once).

### Creating a TAK Server

```
npx deploy create <stackname>
```

### Updating a TAK Server

```
npx deploy update <stackname>
```

### Manual Deploys

Using the `deploy` tool is strongly advised. However the Cloudformation JSON can be generated via:

```sh
npx deploy json
```

and then deployed via the AWS CLI or AWS Console UI.

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

### Server

```sh
docker-compose up
```

