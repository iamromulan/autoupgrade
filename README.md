# opkg-autoupgrade

> **Work in progress** — not yet ready for production use.

Selective automatic package upgrades for OpenWrt. Choose which packages stay updated, on your schedule.

Unlike a full `opkg upgrade` (which can break custom systems), this only upgrades the specific packages you configure. Each package is upgraded individually with full logging.

## Packages

| Package | Description |
|---------|-------------|
| `opkg-autoupgrade` | UCI config, procd init, upgrade script, cron scheduling |
| `luci-app-opkg-autoupgrade` | LuCI web interface for managing auto-upgrades |

## Features

- **Selective upgrades** — only the packages you choose, not everything
- **Scheduled** — daily, weekly, or monthly at a configurable time
- **Dual package manager** — works with both opkg (19.07–24.10) and apk (25.x+)
- **Full logging** — successes, warnings, and failures logged to syslog and `/var/log/opkg-autoupgrade.log`
- **Retry on failure** — if feeds can't be reached (no internet), retries after a configurable interval
- **LuCI integration** — browse installed packages, add them to the auto-upgrade list with one click
- **UCI config** — all settings in `/etc/config/opkg-autoupgrade`, manageable via CLI or LuCI
- **Cron-based scheduling** — zero resource usage between runs; procd reload trigger keeps cron in sync with UCI

## Compatibility

- **OpenWrt 19.07 through 25.x+**
- opkg systems (19.07–24.10) and apk systems (25.x+) are both supported
- LuCI app requires the modern JS framework (19.07+)

## UCI Configuration

```
config autoupgrade 'settings'
	option enabled '1'
	option interval 'daily'
	option time '03:00'
	option retry_interval '30'

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

## Repository Structure

```
utils/opkg-autoupgrade/          # Base package
applications/luci-app-opkg-autoupgrade/  # LuCI app
```

This repo works as a standalone OpenWrt package feed. Add it to your build system:

```
src-git autoupgrade https://github.com/iamromulan/opkg-autoupgrade.git
```

## License

GPL-2.0
