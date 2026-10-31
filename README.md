# magpie-agent-thinkrail

让 [Magpie](https://github.com/yetone/magpie) 以 connect-only agent 的方式接管 [JetBrains ThinkRail](https://github.com/JetBrains/thinkrail) 的模型端点。ThinkRail 内嵌 [pi coding agent](https://pi.dev)，模型配置读 `~/.pi/agent/models.json`。连接时把 Magpie 网关和整个模型目录写入该文件的 `providers.magpie`，断开时还原备份；模型在 ThinkRail 自己的模型选择器里切换。插件只写这一个文件，不碰 `auth.json`。Agents 页的图标用 ThinkRail 官方 favicon（Apache-2.0，出处见 [NOTICE.md](NOTICE.md)）。

本仓库与项目由非专业人士创建，代码主要由 AI 生成，对代码质量的预期不要太高；不保证积极维护，行为以文中标注的实测版本与日期为准。

## 要求

| 项 | 版本 |
|---|---|
| Magpie | 0.1.1243 或更新（依据见下） |
| ThinkRail | 0.2.0 / 0.3.0（Windows 实测；仍从 `~/.pi/agent/models.json` 读 provider 的版本应当都适用） |
| 其他 | 没有别的工具往 `models.json` 写 `magpie` 这个 provider id |

插件能否被看见，取决于 Magpie 会不会按 `magpie-plugin` topic 自动去 GitHub 上找第三方仓库。该能力 2026-10-07 合入上游（提交 `f6f960e4`），现存最早的 release v0.1.1194（2026-10-11）已经带上，更早的 release 已被上游删除、无从考证。agent 插件通道要 0.1.1243 才有，两个条件取交集，下限就是 0.1.1243。本机实测 0.1.2075。

## 安装

仓库私有期间，Magpie 的下载器不带 GitHub 凭据，`github:` 规格会 404（2026-10-31 实测），用本地路径装：

```sh
magpie plugin add ./magpie-agent-thinkrail
```

仓库公开后切到：

```sh
magpie plugin add github:crafthei/magpie-agent-thinkrail
```

## 使用

```sh
magpie ls                          # 装好后应出现 ThinkRail 行
magpie thinkrail                   # 查看当前接线
magpie thinkrail provider magpie   # 连接：写入 providers.magpie（网关 + 全部模型）
magpie thinkrail default           # 断开：还原
magpie plugin rm magpie-agent-thinkrail
```

connect-only 的插件不写"当前模型"：pi 把它存在 `models.json` 之外，`magpie thinkrail <模型id>` 会被静默忽略（实测如此）。连接后重启 ThinkRail，在模型选择器里选 Magpie 分组下的模型。

先断开 agent，再禁用或卸载插件；按上游说明，移除插件不会触发 agent 的断开还原流程。

## 它管什么

Magpie 只管 `~/.pi/agent/models.json` 里的**一个完整对象** `providers.magpie`：

| 托管对象内的字段 | 值 |
|---|---|
| `name` | `Magpie` |
| `baseUrl` | 网关提供的 `/v1` 地址 |
| `apiKey` | Magpie 下发的 key；本机回环下是 `magpie-thinkrail`，Usage 页因此把调用归到 thinkrail 名下 |
| `api` | `openai-completions` |
| `models` | Magpie 暴露的模型目录，映射为 pi 条目 |

Magpie 对这个对象整体 stash、断开整体还原。首次连接前若文件不存在，断开后会留下一个空的 `{"providers": {}}` 壳文件（实测无害）。其他 provider id 和顶层键不受影响。ThinkRail 0.3.0 对这种外部写入的 provider 在界面显示「已托管」（2026-10-31 实测），所以 ThinkRail 侧不需要任何配套代码。

模型条目保留 id、名称、图像输入、为正的 context/output 上限和 pi 支持的思考等级；output 上限超出 context 时按 context 钳制，与 Magpie 内置 Pi adapter 一致。未知上限不写，交给 ThinkRail 用默认值。所有模型走 Magpie 的 Chat Completions 端点，协议翻译由 Magpie 完成。

## 兼容性

| ThinkRail | 状态 |
|---|---|
| 0.2.0、0.3.0（内嵌 pi 1.4.0） | Windows 实测 |

## 开发

单文件模块：零 import、零依赖、无网络调用，`connect()` 是纯计算。单测用 Node 跑：

```sh
node --test test/
```

## 许可

MIT。第三方材料（ThinkRail favicon，Apache-2.0；`@magpie-community/agent-pig` 的模型映射语义，MIT）出处见 [NOTICE.md](NOTICE.md)。

## English

`magpie-agent-thinkrail` adds JetBrains ThinkRail to Magpie as a connect-only agent. Connecting writes the whole `providers.magpie` object (gateway plus full catalog) into `~/.pi/agent/models.json`; disconnecting restores the previous state. Pick the model in ThinkRail's own model picker. Requires Magpie 0.1.1243 or newer. Built by a non-professional; the code was written mostly by AI, so keep expectations for code quality modest. Behaviors are marked with the versions and dates they were tested on.
