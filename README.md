# Auto Poke RNG 脚本仓库

为 [Auto Poke RNG](https://github.com/XiaoyuBook/auto-poke-rng) 发布原版伊机控格式的 `.txt` 脚本及配套图像标签。客户端通过仓库入口浏览、安装和更新，也可以导入 `packages/` 下的 ZIP 版本包。

目前提供 BDSP 官方脚本包：24 个脚本、7 个图像标签。包内脚本由 auto-bdsp-rng 原版脚本适配而来，来源与许可证记录在包描述中。个人 OCR 区域、眼睛模板和校准延迟由客户端单独管理。

## 维护脚本

1. 在 `bundles/<包 ID>/files/` 中修改脚本、标签或说明。
2. 更新同级 `manifest.json` 的版本和说明。已发布的版本包不可覆盖，请增加版本号。
3. 执行 `npm ci`、`npm test`、`npm run build`，提交 PR。

构建器校验路径、版本、图像标签 JSON 及资源清单，生成确定性的 ZIP 和 SHA-256 索引 `catalog.json`。主分支上的 GitHub Actions 自动生成并提交发布文件；PR 只进行构建和验证。

脚本和资源必须作为完整包提交。保留原作者和许可证；贡献者需要说明适用游戏、运行起点、画面要求及实际验证方式。格式校验不能替代脚本编译与实机测试。

## 目录

```text
bundles/bdsp-official/manifest.json    包信息
bundles/bdsp-official/files/           脚本与 ImgLabel
packages/bdsp-official/1.0.0.zip      可安装的完整版本包
catalog.json                         客户端目录索引
```

客户端安装前展示新增、修改、删除和本地冲突。更新时可以保留本地修改，也可以在备份后使用仓库版本。仓库内容不会自动运行。
