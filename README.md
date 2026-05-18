# autoupgrade

> **Beta** — tested on OpenWrt 22.03 and 23.05 (opkg). Looking for testers on additional versions, especially 25.x (apk). Please report issues.

Selective automatic package upgrades for OpenWrt. Choose which packages stay updated, on your schedule.

Unlike a full `opkg upgrade` or `apk upgrade` (which can break custom systems), this only upgrades the specific packages you configure. Each package is upgraded individually with full logging.

## Packages

| Package | Description |
|---------|-------------|
| `autoupgrade` | UCI config, procd init, upgrade script, cron scheduling |
| `luci-app-autoupgrade` | LuCI web interface for managing auto-upgrades |

## Features

- **Selective upgrades** — only the packages you choose, not everything
- **Scheduled** — daily, weekly (pick the day), or monthly (pick the day) at a configurable time
- **Smart monthly scheduling** — if the configured day doesn't exist in a month (e.g. the 31st in April), runs on the last day instead, then re-arms correctly for the next month
- **Dual package manager** — works with both opkg and apk (auto-detected at runtime)
- **Full logging** — successes, warnings, and failures logged to syslog and `/var/log/autoupgrade.log`
- **Retry on failure** — if feeds can't be reached (no internet), retries after a configurable interval
- **LuCI integration** — browse installed packages, add them to the auto-upgrade list with one click
- **UCI config** — all settings in `/etc/config/autoupgrade`, manageable via CLI or LuCI
- **Cron-based scheduling** — zero resource usage between runs; procd reload trigger keeps cron in sync with UCI

## Compatibility

| OpenWrt version | Package manager | Status |
|-----------------|-----------------|--------|
| 19.07 – 24.10   | opkg            | Supported |
| 25.x+           | apk             | Supported |

LuCI app requires the modern JS client-side rendering framework (19.07+).

## UCI Configuration

```
config autoupgrade 'settings'
	option enabled '1'
	option interval 'weekly'
	option time '03:00'
	option retry_interval '30'
	option day_of_week '0'
	option day_of_month '1'

config package
	option name 'tailscale-tiny'

config package
	option name 'luci-app-tailscale-community-tiny'
```

### Options

| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| `enabled` | `0`, `1` | `0` | Enable scheduled upgrades |
| `interval` | `daily`, `weekly`, `monthly` | `daily` | How often to check |
| `time` | `HH:MM` | `03:00` | Time of day to run (24-hour) |
| `retry_interval` | minutes | `30` | Retry delay if feed update fails (0 to disable) |
| `day_of_week` | `0`–`6` | `0` | Day for weekly schedule (0=Sunday) |
| `day_of_month` | `1`–`31` | `1` | Day for monthly schedule (clamped to month length) |

## CLI Usage

Enable and start the service:

```sh
uci set autoupgrade.settings.enabled='1'
uci set autoupgrade.settings.interval='weekly'
uci set autoupgrade.settings.day_of_week='3'    # Wednesday
uci set autoupgrade.settings.time='03:00'
uci commit autoupgrade

/etc/init.d/autoupgrade enable
/etc/init.d/autoupgrade start
```

Add packages to upgrade:

```sh
uci add autoupgrade package
uci set autoupgrade.@package[-1].name='tailscale-tiny'
uci commit autoupgrade
/etc/init.d/autoupgrade reload
```

Run an upgrade immediately:

```sh
/usr/bin/autoupgrade
```

View the log:

```sh
cat /var/log/autoupgrade.log
```

Clear the log:

```sh
/usr/bin/autoupgrade-clearlog
```

Disable and stop:

```sh
/etc/init.d/autoupgrade stop
/etc/init.d/autoupgrade disable
```

## Install from Feed

Pre-built packages are hosted via GitHub Pages. No need to compile from source.

### opkg (OpenWrt 19.07 – 24.10)

```sh
# Add the feed
echo "src/gz autoupgrade https://iamromulan.github.io/autoupgrade/24.10" >> /etc/opkg/customfeeds.conf

# Trust the signing key
wget -O /tmp/autoupgrade.pub https://iamromulan.github.io/autoupgrade/24.10/pubkey
opkg-key add /tmp/autoupgrade.pub

# Install
opkg update
opkg install autoupgrade luci-app-autoupgrade
```

### apk (OpenWrt 25.x+)

```sh
echo "https://iamromulan.github.io/autoupgrade/25.12" >> /etc/apk/repositories.d/autoupgrade.list
apk update
apk add autoupgrade luci-app-autoupgrade
```

## Build from Source

This repo is a standalone OpenWrt package feed. Add it to your build system:

```
src-git autoupgrade https://github.com/iamromulan/autoupgrade.git
```

### Repository Structure

```
utils/autoupgrade/                    # Base package
applications/luci-app-autoupgrade/    # LuCI app
```

## License

- `autoupgrade` — GPL-2.0-only
- `luci-app-autoupgrade` — Apache-2.0
