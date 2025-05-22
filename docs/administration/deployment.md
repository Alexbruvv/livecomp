---
title: Deployment structure
---

# {{ $frontmatter.title }}

Livecomp is a reasonably standard client-server application, and can be deployment as such.
Due to the use of WebSockets, it does not currently support serverless deployment, and does not support horizontal scaling of the server—the latter will be addressed in the future.

This guide provides a simple method for deploying Livecomp on Linux, but assumes basic system administration knowledge.

## Manual deployment guide

Prerequisites:

- A Linux operating system (this guide was tested on Ubuntu)
- A PostgreSQL server with a database created for Livecomp
- [Bun](https://bun.sh)

Firstly, clone the repository and install the dependencies.

```bash
git clone https://github.com/Alexbruvv/livecomp.git
cd livecomp
bun install
```

Then, configure the server.

```bash
cd apps/server
cp .example.env .env
nano .env # Update the configuration values to your own
```

To start the server, run the following command from the `apps/server` directory.

```bash
bun run src/server.ts start --port 3000 --migrate
```

This will start the server on port `3000` and run any necessary database migrations.
It is recommended that the `--migrate` flag is always passed.

Next, configure the client.

```bash
cd apps/client
cp .example.env
nano .env # Update the configuration values to your own
```

To start the client, run the following command from the `apps/client` directory.

```bash
bunx serve -s -l 3001
```

This will start the client on port `3001`. The `-s` flag ensures that all subpaths are routed to `index.html`.

Finally, from the `apps/server` directory, the following command can be executed to create a user.

```bash
bun run src/server.ts create-sysadmin-user <username> <password>
```

## Additional steps

This documentation specifies the basic steps to deploy the system, but administrators may wish to consider the following:

- Using a reverse proxy to route traffic to the client and server with TLS
- Using `systemd` services, or similar, to ensure the system remains up
- Writing a simple deployment script to deploy updates

Example deployment script (relies on [just](https://github.com/casey/just)):

```bash
cd livecomp
git pull

bun install

just build
just migrate

# Adjust to your own deployment
systemctl restart livecomp-server
systemctl restart livecomp-client
```

