# Livecomp

![Lint + Format CI Status](https://github.com/alexbruvv/livecomp/actions/workflows/lint.yml/badge.svg)

Livecomp is a software stack for running robotics competitions.

## Architecture

### Server

The server provides a TRPC router, as well the main match runner.
It is expected that there is exactly one instance of the server for any deployment.

### Client

The client provides the console and the displays.

The console allows users to interact with the system and configure/run a competition, while the displays are used for in-venue digital signage.
The displays can be remotely controlled from the console.

## Development

Requirements:

- [Bun](https://bun.sh)
- A Postgres server

Steps:

1. In both the `packages/client` and `packages/server` directories, copy the `.example.env` file to `.env` and specify your own values for the environment variables
2. Navigate back to the root directory (the one that contains this README)
3. Run `bun install`
4. Run `bun db:migrate`
5. Navigate to the `packages/server` directory and run `bun run src/main.ts create-sysadmin-user <username> <password>` to create a system administrator user
6. Run `bun dev` - check the client output for the port the client is running on

