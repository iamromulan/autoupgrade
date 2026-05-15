# autoupgrade

> **Work in progress** — not yet ready for production use.

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

## Repository Structure

```
utils/autoupgrade/                    # Base package
applications/luci-app-autoupgrade/    # LuCI app
```

This repo works as a standalone OpenWrt package feed. Add it to your build system:

```
src-git autoupgrade https://github.com/iamromulan/autoupgrade.git
```

## License

- `autoupgrade` — GPL-2.0-only
- `luci-app-autoupgrade` — Apache-2.0
