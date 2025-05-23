---
title: CLI
---

# {{ $frontmatter.title }}

:::warning
This feature is not fully ready. Breaking changes are possible, and bugs may be present.
:::

A command-line interface exists to interact with Livecomp instances.

To install the CLI, run the following command:

```bash
curl -fsSL https://cdn.livecomp.co.uk/install-cli.sh | bash
```

**Note:** A Windows installer is coming soon.

## Working directories

The CLI can control multiple Livecomp instances.
The presence of a `livecomp.toml` configuration file is used to specify the selected instance and competition.
To create one, run the following command:

```bash
livecomp init <server-url>
```

Once the configuration file has been created, you can log in with the following command:

```bash
livecomp auth login <username>
```

Use `livecomp --help` to view other available commands.
To update to the latest version of the CLI, simply run the installer again—an `upgrade` command is coming soon.

