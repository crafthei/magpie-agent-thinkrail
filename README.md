# magpie-agent-thinkrail

`magpie-agent-thinkrail` adds [JetBrains ThinkRail](https://github.com/JetBrains/thinkrail) to [Magpie](https://github.com/yetone/magpie) as a **connect-only agent**. ThinkRail embeds the [pi coding agent](https://pi.dev) and reads model providers from `~/.pi/agent/models.json`. Connecting writes one complete `providers.magpie` object there: the local gateway plus your whole model catalog. Disconnecting restores the previous state. You pick the model in ThinkRail's own picker. The plugin never writes `auth.json` or any other file. The Agents row shows ThinkRail's own favicon (Apache-2.0, see [NOTICE.md](NOTICE.md)).

This is an unofficial integration. The author is a non-professional, and the code was written mostly by AI, so don't expect too much of the code quality. The project may not be actively maintained. Every behavior below is marked with the version and date it was tested on, and upstream changes can break it at any time.

## Requirements

| | |
|---|---|
| Magpie | 0.1.1243 or newer (see below) |
| ThinkRail | 0.2.0 / 0.3.0, tested on Windows; any build that still reads `~/.pi/agent/models.json` should work |
| Other | No other tool may write the `magpie` provider id into `models.json` |

Whether the plugin shows up at all depends on Magpie's ability to discover third-party plugin repositories on GitHub by the `magpie-plugin` topic. That landed upstream on 2026-10-07 (commit `f6f960e4`). The oldest release still published, v0.1.1194 (2026-10-11), already has it; older releases were deleted, so the exact first version cannot be pinned. The agent-plugin channel itself needs 0.1.1243, which is therefore the effective floor. Tested locally on 0.1.2075.

## Install

While the repository is private, Magpie's downloader carries no GitHub credentials and the `github:` spec 404s (tested 2026-10-31). Install from a local checkout:

```sh
magpie plugin add ./magpie-agent-thinkrail
```

Once the repository is public:

```sh
magpie plugin add github:crafthei/magpie-agent-thinkrail
```

## Use

```sh
magpie ls                          # ThinkRail appears once the install dir exists
magpie thinkrail                   # show the current wiring
magpie thinkrail provider magpie   # connect: writes providers.magpie (gateway + catalog)
magpie thinkrail default           # disconnect: restore
magpie plugin rm magpie-agent-thinkrail
```

Connect-only agents write no model: pi keeps the current model outside `models.json`, so `magpie thinkrail <model>` is silently ignored (tested). After connecting, restart ThinkRail and pick a model under the **Magpie** group in its own model picker.

Disconnect the agent before disabling or uninstalling the plugin; per upstream guidance, removing a plugin does not run the agent's disconnect flow.

## What it owns

Magpie manages **one complete object**, `providers.magpie`, inside `~/.pi/agent/models.json`:

| Field inside the managed object | Value |
| --- | --- |
| `name` | `Magpie` |
| `baseUrl` | the gateway's `/v1` address |
| `apiKey` | the key Magpie supplies; `magpie-thinkrail` on loopback, so Usage attributes the calls to `thinkrail` |
| `api` | `openai-completions` |
| `models` | the catalog Magpie exposes, mapped to pi entries |

Magpie stashes the object and restores it on agent disconnect. If no `magpie` provider existed before the first connect, an empty `{"providers": {}}` shell file can remain afterwards (tested, harmless). Other provider ids and top-level keys stay in place. ThinkRail 0.3.0 shows such externally written providers as「已托管」("managed") in its UI (tested 2026-10-31), so no ThinkRail-side code is needed.

Model entries keep their ids, names, image input capability, positive context/output limits and supported pi thinking levels; a published output limit is capped at the context window, matching Magpie's Pi adapter. Unknown limits are omitted so ThinkRail applies its own defaults. All models go through Magpie's Chat Completions endpoint; upstream protocol translation is Magpie's job.

## Compatibility

| ThinkRail | Status |
|---|---|
| 0.2.0, 0.3.0 (embedded pi 1.4.0) | tested on Windows |

## Development

Single-file module: no imports, no dependencies, no network calls, and `connect()` is pure computation. Run the unit tests with Node:

```sh
node --test test/
```

## License

MIT. Third-party material (the ThinkRail favicon, Apache-2.0; the model-mapping semantics of `@magpie-community/agent-pig`, MIT) is credited in [NOTICE.md](NOTICE.md).

## 中文

`magpie-agent-thinkrail` 让 Magpie 以 connect-only agent 的方式接管 JetBrains ThinkRail 的模型端点。连接时把 Magpie 网关与全部模型目录整体写入 `~/.pi/agent/models.json` 的 `providers.magpie`，断开时还原备份；模型在 ThinkRail 自己的模型选择器里切换。要求 Magpie ≥ 0.1.1243（按 `magpie-plugin` topic 自动发现 GitHub 第三方仓库的能力更早已合入上游，见英文部分的考证）。本仓库与项目由非专业人士创建，代码主要由 AI 生成，对代码质量的预期不要太高；不保证积极维护，行为以文中标注的实测版本与日期为准。
