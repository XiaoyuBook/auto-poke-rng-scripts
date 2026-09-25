# Auto Poke RNG 脚本仓库

为 [Auto Poke RNG](https://github.com/XiaoyuBook/auto-poke-rng) 发布原版伊机控格式的 `.txt` 脚本及配套图像标签。客户端通过仓库入口浏览、安装和更新，也可以导入 `packages/` 下的 ZIP 版本包。

目前提供珍钻复刻官方脚本包：24 个脚本、7 个图像标签。包内脚本由 auto-bdsp-rng 原版脚本适配而来，来源与许可证记录在包描述中。个人文字识别区域、眼睛模板和校准延迟由客户端单独管理。

## 维护脚本

1. 在 `bundles/<包 ID>/files/` 中修改脚本、标签或说明。
2. 更新同级 `manifest.json` 的版本和说明。已发布的版本包不可覆盖，请增加版本号。
3. 执行 `npm ci`、`npm test`、`npm run build`，提交 PR。

构建器校验路径、版本、图像标签 JSON 及资源清单，生成确定性的 ZIP 和 SHA-256 索引 `catalog.json`。主分支上的 GitHub Actions 自动生成并提交发布文件；PR 只进行构建和验证。

包描述中的 `game` 使用稳定标识（例如 `BDSP`），客户端显示中文游戏名称。`categories` 按用途列出文件路径，构建时生成带用途信息的文件清单；包内 `README.md` 会同时发布到目录，供安装前阅读。只调整分类与说明时也必须提高版本号，不能替换旧版 ZIP。

## Gitee 下载与同步

国内仓库：<https://gitee.com/shekongsk/auto-poke-rng-scripts>。客户端可以选择 GitHub 或 Gitee，公开下载无需令牌。

在本 GitHub 仓库的 Settings → Secrets and variables → Actions 中配置 `GITEE_ACCESSS_TOKEN_AUTO_POKE_RNG`，值为有权推送到上述 Gitee 仓库的令牌。主项目的仓库级 Secret 不会自动继承，GitHub 也不能读回其原值。

`.github/workflows/sync-to-gitee.yml` 在发布流程成功后同步已生成的索引与压缩包，也可手动运行。缺少 Secret 时会明确记录“未同步”；配置完成后运行一次工作流即可补齐。同步只推进 `main`，不会强制覆盖 Gitee 上独立提交的内容。

脚本和资源必须作为完整包提交。保留原作者和许可证；贡献者需要说明适用游戏、运行起点、画面要求及实际验证方式。格式校验不能替代脚本编译与实机测试。

## 目录

```text
bundles/bdsp-official/manifest.json    包信息
bundles/bdsp-official/files/           脚本与 ImgLabel
packages/bdsp-official/1.0.1.zip      可安装的完整版本包
catalog.json                         客户端目录索引
```

客户端安装前展示新增、修改、删除和本地冲突。更新时可以保留本地修改，也可以在备份后使用仓库版本。仓库内容不会自动运行。
