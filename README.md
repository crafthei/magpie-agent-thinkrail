# magpie-agent-thinkrail

[JetBrains ThinkRail](https://github.com/JetBrains/thinkrail) as a connect-only
[Magpie](https://github.com/yetone/magpie) agent.

ThinkRail embeds the [pi coding agent](https://pi.dev) and reads model providers
from `~/.pi/agent/models.json`. Installing this plugin gives Magpie a
**ThinkRail** row on its Agents page: connect injects one `magpie` provider
(the local gateway plus your whole model catalog) into that file, and
disconnecting puts back exactly what was there before.

中文说明：本插件让 Magpie 能识别并接管 JetBrains ThinkRail 的模型端点——连接时把
Magpie 网关与你的模型目录整体写入 `~/.pi/agent/models.json` 的 `providers.magpie`，
断开时原样还原。模型在 ThinkRail 自己的模型选择器里切换。

## Requirements

- Magpie ≥ 0.1.1243 (agent plugins); tested on 0.1.2075
- ThinkRail 0.2.0 / 0.3.0 (Windows tested; anything that keeps `~/.pi/agent/models.json` should work)
- No other tool writing the `magpie` provider id into `~/.pi/agent/models.json`

## Install

While this repository is **private**, Magpie's installer cannot fetch it (its
GitHub download does not carry your `gh` credentials — the tarball request
404s). Install from a local checkout instead:

```
magpie plugin add ./magpie-agent-thinkrail
```

Once the repository is public (see the publishing note at the bottom), the
GitHub spec works:

```
magpie plugin add github:crafthei/magpie-agent-thinkrail
```

## Use

```
magpie ls                      # ThinkRail appears once the install dir exists
magpie thinkrail               # show its current wiring
magpie thinkrail <model>       # connect: writes providers.magpie and points at <model>*
magpie thinkrail default       # disconnect: restores the previous file
magpie plugin rm magpie-agent-thinkrail
```

\* The provider catalog is injected; pick the actual model in **ThinkRail's own
model picker** (pi keeps the current model outside `models.json`). Restart
ThinkRail after connecting so the new provider is picked up.

## How it works

- `connect()` returns the whole `providers.magpie` object (Magpie stashes and
  restores it as one unit — no partial writes, no leftovers on disconnect).
- `api: "openai-completions"` — Magpie translates whatever your subscriptions
  speak, so one provider covers every model in your Magpie catalog.
- The gateway key sent is `magpie-thinkrail`, so Magpie's Usage page attributes
  ThinkRail's calls correctly.
- ThinkRail-side alternative: the same integration exists as a pi extension
  (`magpie-gateway.ts`, registers the provider in memory without Magpie
  managing it). **Pick one — both register the `magpie` provider id.**

## Compatibility

| ThinkRail | Status |
|---|---|
| 0.2.0, 0.3.0 (embedded pi 1.4.0) | tested on Windows |

Model entries follow `@magpie-community/agent-pig` (MIT), including the
"Match Magpie's Pi adapter" output-limit clamp. See NOTICE.md for third-party
material.

## Security & publishing note

This repository ships **private first**. Before making it public: review the
checklist in this repo's history/docs (zero dependencies, no secrets, no
telemetry, verified disconnect-restore), then set the repo to public and add
the GitHub topic **`magpie-plugin`** — Magpie lists public repos with that
topic on its Plugins page (source: `internal/plugin/github.go`).
