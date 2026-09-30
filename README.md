# Auto Poke RNG 脚本仓库

为 [Auto Poke RNG](https://github.com/XiaoyuBook/auto-poke-rng) 发布原版伊机控格式的 `.txt` / `.ecs` 脚本及配套图像标签。客户端通过仓库入口浏览、安装和更新，也可以导入 `packages/` 下的 ZIP 版本包。

目前按游戏 → 脚本用途组织 22 个珍钻复刻独立脚本包，可分别安装与更新。用途分为过帧、过场、反查、撞帧、逃跑、测种六类；每类在 `categories/<分类>/README.md` 维护一份共用说明，逃跑类暂时没有脚本。取名脚本属于撞帧类，文字识别翻页和录屏已从目录移除。红圣菇、美梦神各携带实际引用的 4 个图像标签，位于各自脚本旁的 `ImgLabel/`；其余 20 个包不携带标签。脚本文本和文件名保持原版 `.txt` 格式，单脚本起始条件、作者和来源记录在包描述中。个人文字识别区域、眼睛模板和校准延迟由客户端单独管理。

另提供火红叶绿 `frlg-automation` 0.0.2 自动流程包，目录共 23 包。火叶包保留原版正式／时间轴入口、共享库、1154 个标签和两份 OCR 模型，客户端按当前方案生成独立运行工程，执行捕获、识别、反查、校准和重试。0.0.2 修复第0轮设置检查的主菜单定位，详情见包内 SOURCE.md。标签要求 1920×1080 视频；队伍、道具和游戏起点要求见安装说明及原版入口日志。运行使用客户端自己的伊机控、视频和 OCR；专用 Tesseract 模型保留作来源资源，实际 OCR 使用客户端共享 PP-OCR，识别效果和时序仍需实机验收。

珍钻包构建时附带根目录 `LICENSE.md`。火叶外部脚本、标签和模型保留上游权利，标记 `NOASSERTION`，并附来源说明，不重新声明为 GPL。详细发布来源与指纹见 `bundles/frlg-automation/files/SOURCE.md`。

当前发布 **0.0.4 测试版**。测试阶段按 `0.0.x` 递增，正式上线时再发布 `1.0.0`。旧 `packages/bdsp-official/0.0.1.zip` 和已退出目录的脚本包压缩文件保留原始字节供恢复，不再列入新索引。早期试验中误用的 `1.0.0`、`1.0.1` 原文件可从 Git 历史恢复，不作为正式发布。

已有 `BDSP/` 大包的用户直接按需安装独立包：客户端预览从旧目录迁移的文件，默认保留个人修改和删除，源文件留作备份，自动流程旧路径对应到新包。新包使用独立 ID，不需要删除原安装记录，也不会覆盖尚未迁移的其他脚本或个人标签。请使用支持独立包的新版客户端。

## 维护脚本

1. 在 `bundles/<包 ID>/files/` 中修改脚本或标签；通用说明修改 `categories/<分类>/README.md`，单脚本条件修改 `manifest.json` 的 `instructions`。
2. 脚本、标签或单包描述变更时更新 `manifest.json` 的版本。已发布的版本包不可覆盖，请增加版本号。仅修改分类 README 时，目录索引会更新，包版本无需变化。
3. 执行 `npm ci`、`npm test`、`npm run build`，提交 PR。

构建器校验路径、版本、图像标签 JSON 及资源清单，检查脚本引用的 `@标签`，并拒绝重复或互相包含的安装目录。珍钻包拒绝未使用标签；火叶完整工程保留原版附加标签并核对全部脚本、标签和模型指纹。生成确定性的 ZIP 和 SHA-256 索引 `catalog.json`。主分支上的 GitHub Actions 自动生成并提交发布文件；PR 只进行构建和验证。

包描述中的 `game` 使用稳定标识（如 `BDSP`、`FRLG`），客户端显示中文游戏名称。`manifest.json` 的 `categories` 按用途列出文件路径，构建时生成带用途信息的文件清单；分类 README 单独发布到目录索引，供安装前阅读。构建器按上述包来源生成授权说明。

`installFolder` 使用中文游戏与功能路径，如 `珍钻复刻/红圣菇`；`legacyPaths` 将包内文件映射到旧库相对路径，例如 `红圣菇.txt` → `BDSP/红圣菇.txt`。同一个标签可以分别放入多个确实使用它的包，各包独立维护，避免一个脚本更新影响另一个。

## Gitee 下载与同步

国内仓库：<https://gitee.com/shekongsk/auto-poke-rng-scripts>。客户端可以选择 GitHub 或 Gitee，公开下载无需令牌。

在本 GitHub 仓库的 Settings → Secrets and variables → Actions 中配置 `GITEE_ACCESSS_TOKEN_AUTO_POKE_RNG`，值为有权推送到上述 Gitee 仓库的令牌。主项目的仓库级 Secret 不会自动继承，GitHub 也不能读回其原值。

`.github/workflows/sync-to-gitee.yml` 在发布流程成功后同步已生成的索引与压缩包，也可手动运行。缺少 Secret 时会明确记录“未同步”；配置完成后运行一次工作流即可补齐。同步只推进 `main`，不会强制覆盖 Gitee 上独立提交的内容。

脚本和资源必须作为完整包提交。保留原作者和许可证；贡献者需要说明适用游戏、运行起点、画面要求及实际验证方式。格式校验不能替代脚本编译与实机测试。

## 目录

```text
LICENSE.md                              仓库统一许可证
categories/撞帧脚本/README.md            撞帧分类说明
bundles/bdsp-mesprit/manifest.json       红圣菇包信息与起始条件
bundles/bdsp-mesprit/files/红圣菇.txt     原版脚本
bundles/bdsp-mesprit/files/ImgLabel/     4 个必需标签
bundles/bdsp-seed/files/BDSP测种.txt     无需标签的独立测种包
packages/bdsp-mesprit/0.0.4.zip         可安装的测试包
catalog.json                           客户端目录索引
```

客户端安装前展示新增、修改、删除和本地冲突。更新时可以保留本地修改，也可以在备份后使用仓库版本。仓库内容不会自动运行。
