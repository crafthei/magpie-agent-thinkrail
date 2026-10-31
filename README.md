# magpie-agent-thinkrail

让 [Magpie](https://github.com/yetone/magpie) 接管 [JetBrains ThinkRail](https://github.com/JetBrains/thinkrail) 的模型端点。ThinkRail 内嵌 [pi coding agent](https://pi.dev)，模型配置读 `~/.pi/agent/models.json`。装上本插件，Magpie 的 Agents 页会多出 ThinkRail 一行：连接时把 Magpie 网关和你的整个模型目录写进那个文件的 `providers.magpie`，断开时按备份还原。模型在 ThinkRail 自己的模型选择器里切换。

## 写给使用者

本仓库和项目由非专业编程人员创建，不保证积极维护。文中每条行为都标了实测版本与日期，上游一改就可能失效。是否选用，请以这份预期为准。

## 它做什么

ThinkRail 没有暴露自定义 OpenAI 兼容端点的设置，但它读 `~/.pi/agent/models.json`（内嵌 pi 的约定），而 Magpie 的 agent 插件恰好只会写一个文件。本插件占住 `providers.magpie` 这个键：连接写入整个 provider（网关地址、目录里的全部模型），断开整体移除并还原备份。首次连接前如果这个文件不存在，断开后会留下一个空的 `{"providers": {}}` 壳文件，实测无害。ThinkRail 0.3.0 对这种外部写入的 provider 直接显示「已托管」（2026-10-31 实测），官方已经适配这种接法。

## 要求

| 项 | 版本 |
|---|---|
| Magpie | 0.1.1243 或更新（依据见下） |
| ThinkRail | 0.2.0 / 0.3.0（Windows 实测；仍从 `~/.pi/agent/models.json` 读 provider 的版本应当都适用） |
| 其他 | 没有别的工具往 `models.json` 写 `magpie` 这个 provider id |

插件能不能被看见，取决于 Magpie 会不会按 `magpie-plugin` topic 自动去 GitHub 上找第三方仓库。这个能力 2026-10-07 合入上游（提交 `f6f960e4`），现存最早的发布版 v0.1.1194（2026-10-11）已经带上，更早的 release 已被上游删除、无从考证。agent 插件通道要 0.1.1243 才有，两个条件取交集，下限就是 0.1.1243。本机实测 0.1.2075。

## 安装

仓库私有期间，Magpie 的下载器不带 GitHub 凭据，`github:` 规格会 404（2026-10-31 实测），用本地路径装：

```
magpie plugin add ./magpie-agent-thinkrail
```

仓库公开后切到：

```
magpie plugin add github:crafthei/magpie-agent-thinkrail
```

## 使用

```
magpie ls                          # 装好后应出现 ThinkRail 行
magpie thinkrail                   # 查看当前接线
magpie thinkrail provider magpie   # 连接：写入 providers.magpie（网关 + 全部模型）
magpie thinkrail default           # 断开：还原
magpie plugin rm magpie-agent-thinkrail
```

connect-only 的插件不写"当前模型"，pi 把它存在 `models.json` 之外，`magpie thinkrail <模型id>` 会被静默忽略（实测如此）。连接后重启 ThinkRail，在它自己的模型选择器里挑 Magpie 分组下的模型。

## 工作原理

- `connect()` 返回完整的 `providers.magpie` 对象，Magpie 对它整体 stash、整体还原，没有部分写入。
- `api: "openai-completions"`：协议翻译由 Magpie 做，一个 provider 盖住目录里所有模型。
- 发给网关的 key 是 `magpie-thinkrail`，Magpie 的 Usage 页因此能把调用归到 thinkrail 名下。
- ThinkRail 侧不需要任何配套代码：外部写入的 provider 在其界面显示「已托管」（0.3.0，2026-10-31 实测）。

## 兼容性

| ThinkRail | 状态 |
|---|---|
| 0.2.0、0.3.0（内嵌 pi 1.4.0） | Windows 实测 |

模型条目的映射（含输出上限不超上下文窗口的钳制）照 `@magpie-community/agent-pig`（MIT）的语义，第三方材料出处见 [NOTICE.md](NOTICE.md)。

## 许可与发布

MIT。仓库先私有，安全核查通过后才转公开、打 topic `magpie-plugin`，Magpie 的 Plugins 页按这个 topic 收录公开仓（源码 `internal/plugin/github.go`）。
