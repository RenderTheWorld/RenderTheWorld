# RenderTheWorld 项目结构整理说明

## 一、整理目标

本次结构调整重点解决以下问题：

1. `src/utils` 文件夹内文件过度拆分，功能混杂（同时包含渲染工具、Scratch 环境注入、Blockly 增强、平台适配、国际化等），导致管理混乱。
2. 部分文件存放位置与其功能职责不符，例如：
   - 与 Scratch/Blockly 内部机制相关的补丁放在 `core/hooks.js`；
   - 平台专属代码（TurboWarp/Gandi）散落在 `utils`；
   - 通用日志工具与渲染工具混在一起。
3. 导入路径需要跟随目录调整全面更新，确保 `tsc --noEmit` 与 `npm run build` 零错误。

## 二、调整前后结构对比

### 2.1 顶层目录对比

| 调整前 | 调整后 | 说明 |
|--------|--------|------|
| `src/utils/`（大量混杂文件） | 删除（理想情况）或清空 | 功能按职责拆分到新目录 |
| `src/core/hooks.js` | `src/patches/` | 所有 Scratch/Blockly 内部机制补丁独立成册 |
| `src/core/format.js` | `src/l10n/format.js` | 国际化相关工具归入 `l10n` |
| — | `src/rendering/` | 新增：3D 渲染相关工具 |
| — | `src/scratch/` | 新增：Scratch 环境实例、注入器、Patcher |
| — | `src/blockly/` | 新增：Blockly 增强（动态参数、嵌套分类） |
| — | `src/platform/` | 新增：平台适配（TurboWarp / Gandi） |
| — | `src/patches/` | 新增：运行时补丁集合 |
| — | `src/common/` | 新增：通用工具（日志等） |

### 2.2 `src/utils` 文件迁移明细

| 原路径 | 新路径 | 功能归类 |
|--------|--------|----------|
| `src/utils/RTWTools.js` | `src/rendering/RTWTools.js` | 3D 对象包装、颜色工具 |
| `src/utils/canvasSkin.js` | `src/rendering/canvasSkin.js` | Scratch Skin 实现 |
| `src/utils/dom.js` | `src/rendering/dom.js` | DOM/Canvas 辅助 |
| `src/utils/arkos_patcher.js` | `src/scratch/patcher.js` | Scratch 函数劫持 |
| `src/utils/injector.js` | `src/scratch/injector.js` | VM / ScratchBlocks 注入 |
| `src/utils/scratch-instance.js` | `src/scratch/instance.js` | Scratch 兼容实例创建 |
| `src/utils/scratchTools.js` | `src/scratch/tools.js` | Scratch 环境工具集 |
| `src/utils/extendableBlock.js` | `src/blockly/expandableBlock.js` | 可扩展积木（动态参数） |
| `src/utils/mutatorBlock.js` | `src/blockly/mutatorBlock.js` | 下拉驱动动态参数积木 |
| `src/utils/nestedCategory.js` | `src/blockly/nestedCategory.js` | 工具栏嵌套分类 |
| `src/utils/gandi-color.js` | `src/platform/gandi/color.js` | Gandi 颜色适配 |
| `src/utils/gandiAssetTools.js` | `src/platform/gandi/assetTools.js` | Gandi 资源工具 |
| `src/utils/tw-external.js` | `src/platform/turbowarp/external.js` | TurboWarp external 适配 |
| `src/utils/tw-static-fetch.js` | `src/platform/turbowarp/staticFetch.js` | TurboWarp 静态资源 fetch |
| `src/utils/logger.js` | `src/common/logger.js` | 通用日志 |
| `src/utils/format.js` | `src/l10n/format.js` | 国际化格式化 |
| `src/utils/base64-util.js` | 合并入 `src/platform/gandi/assetTools.js` | Base64 仅被 Gandi 资源使用 |
| `src/core/hooks.js` | 拆分为 `src/patches/outputBlocks.js` 等 | 按补丁职责拆分 |

### 2.3 当前完整目录结构

```
src/
├── adapters/           # 渲染器适配层
│   └── rendererAdapter.js
├── assets/             # 扩展静态资源（图标、颜色常量）
│   └── index.js
├── blockly/            # Blockly 增强
│   ├── expandableBlock.js    # 可扩展积木（动态参数）
│   ├── mutatorBlock.js       # 下拉驱动动态参数积木
│   └── nestedCategory.js     # 工具栏嵌套分类
├── blocks/             # 积木分组
│   ├── groups/         # 各功能分组
│   │   ├── animationGroup.js
│   │   ├── cameraGroup.js
│   │   ├── controlsGroup.js
│   │   ├── effectsGroup.js
│   │   ├── fogGroup.js
│   │   ├── hierarchyGroup.js
│   │   ├── lightingGroup.js
│   │   ├── materialGroup.js
│   │   ├── mathGroup.js
│   │   ├── modelGroup.js
│   │   ├── settingsGroup.js
│   │   ├── skyGroup.js
│   │   ├── textureGroup.js
│   │   └── transformGroup.js
│   ├── BlockGroup.js   # 分组基类
│   └── index.js        # 分组聚合
├── common/             # 通用工具
│   └── logger.js
├── core/               # 扩展核心
│   ├── SceneManager.js
│   ├── SessionGuard.js
│   ├── extcore.js
│   ├── main.js
│   └── renderengine.js
├── l10n/               # 国际化
│   ├── format.js
│   └── index.js
├── patches/            # Scratch/Blockly 运行时补丁
│   ├── gandiAssets.js
│   ├── index.js
│   ├── outputBlocks.js
│   └── textDropDowns.js
├── platform/           # 平台适配
│   ├── gandi/          # Gandi IDE
│   │   ├── assetTools.js
│   │   └── color.js
│   └── turbowarp/      # TurboWarp
│       ├── external.js
│       └── staticFetch.js
├── rendering/          # 3D 渲染工具
│   ├── RTWTools.js
│   ├── canvasSkin.js
│   └── dom.js
├── scratch/            # Scratch 环境工具
│   ├── injector.js
│   ├── instance.js
│   ├── patcher.js
│   └── tools.js
├── static/             # 扩展 Logo 等静态文件
├── test/               # 测试/参考实现
└── index.js            # 扩展入口
```

## 三、调整依据

### 3.1 分类标准

新结构按照 **"功能职责单一、依赖方向清晰、便于并行开发"** 的原则划分：

| 目录 | 职责 | 可依赖的目录 |
|------|------|--------------|
| `common` | 与业务无关的通用工具（日志、纯函数） | 无 |
| `platform` | 不同宿主环境（TurboWarp / Gandi）的适配实现 | `common` |
| `scratch` | Scratch 运行时、VM、ScratchBlocks 的获取与封装 | `common`, `platform` |
| `blockly` | 对 Blockly 编辑器的增强（动态参数、嵌套分类） | `common`, `scratch` |
| `rendering` | 3D 渲染管线、Scratch Skin、DOM 辅助 | `common` |
| `core` | 扩展核心对象与渲染引擎 | `common`, `rendering`, `scratch` |
| `patches` | 对 Scratch/Blockly 内部方法的运行时补丁 | `common`, `scratch`, `blockly` |
| `blocks` | 积木定义与执行逻辑 | 所有上层目录 |
| `l10n` | 翻译数据收集与格式化 | `blocks`, `common` |

### 3.2 关键设计决策

1. **删除 `utils` 大杂烩**
   原 `utils` 同时承担渲染、注入、平台适配、Blockly 增强等职责，边界模糊。按功能重新归类后，新增文件可快速定位归属。

2. **`core/hooks.js` 拆分为 `patches/`**
   `hooks.js` 混合了 OUTPUT 块形状、hat 参数颜色、Gandi 资源、文本下拉菜单等多种不相关补丁。拆分为独立文件后：
   - 每个补丁职责单一；
   - `patches/index.js` 统一导出，便于 `index.js` 集中调用；
   - 补丁生命周期（清理函数）便于管理。

3. **平台代码下沉到 `platform/`**
   TurboWarp 的 `external`/`staticFetch` 与 Gandi 的颜色/资源工具原本散落在 `utils`，现在按平台隔离，避免 TurboWarp 环境加载 Gandi 专有代码，反之亦然。

4. **Blockly 增强独立为 `blockly/`**
   `expandableBlock.js`、`mutatorBlock.js`、`nestedCategory.js` 均是对 Blockly 编辑器行为的增强，与运行时积木逻辑分离，降低心智负担。

5. **`base64-util.js` 合并入 `platform/gandi/assetTools.js`**
   该工具仅被 Gandi 资源加载使用，不再作为独立文件存在，减少碎片化。

## 四、导入路径更新要点

本次调整涉及的主要导入路径更新如下：

| 文件 | 调整前 | 调整后 |
|------|--------|--------|
| `src/scratch/instance.js` | `./tw-external.js`、 `./tw-static-fetch.js`、 `./gandi-color.js`、 `./arkos_patcher.js` | `../platform/turbowarp/external.js`、 `../platform/turbowarp/staticFetch.js`、 `../platform/gandi/color.js`、 `./patcher.js` |
| `src/blockly/mutatorBlock.js` | `./injector.js` | `../scratch/injector.js` |
| `src/scratch/tools.js` | `./RTWTools.js` | `../rendering/RTWTools.js` |
| `src/core/SceneManager.js` | `../utils/RTWTools.js` | `../rendering/RTWTools.js` |
| `src/core/main.js` | `../utils/logger.js`（JSDoc） | `../common/logger.js` |
| `src/core/extcore.js` | 相对 `core/format.js` | `../l10n/format.js` |
| `src/blocks/groups/*.js` | `../../utils/RTWTools.js` | `../../rendering/RTWTools.js` |
| `src/blocks/groups/*.js` | `../../utils/extendableBlock.js` | `../../blockly/expandableBlock.js` |
| `src/index.js` | `./core/hooks.js` | `./patches/index.js` |

## 五、新结构使用规范

### 5.1 新增文件时如何选址

| 如果你的代码... | 请放入 |
|-----------------|--------|
| 与 Three.js / WebGL / Scratch Skin 相关 | `src/rendering/` |
| 与 Scratch VM / Runtime / ScratchBlocks 获取相关 | `src/scratch/` |
| 与 Blockly 编辑器增强（动态参数、分类、菜单）相关 | `src/blockly/` |
| 与 TurboWarp / Gandi 平台专有 API 相关 | `src/platform/<平台>/` |
| 是对 Scratch/Blockly 内部方法的运行时补丁 | `src/patches/` |
| 是扩展核心对象或渲染引擎 | `src/core/` |
| 是纯通用工具（日志、常量、纯函数） | `src/common/` |
| 是积木定义与执行逻辑 | `src/blocks/groups/` |
| 是翻译/格式化 | `src/l10n/` |

### 5.2 禁止事项

- **禁止**在 `src/utils` 下新增文件；该目录已废弃。
- **禁止**跨层反向依赖，例如 `common` 不应依赖 `blocks`、`rendering` 或 `core`。
- **禁止**将平台专属代码直接写在 `index.js` 或 `core` 中，应下沉到 `src/platform/`。
- **禁止**单个文件承担多种补丁职责，新增补丁请创建 `src/patches/<补丁名>.js` 并在 `src/patches/index.js` 导出。

### 5.3 导入路径约定

- 同一目录内文件使用 `./` 相对导入。
- 跨目录导入使用 `../<目录>/` 相对路径，避免使用别名以保持与当前构建配置一致。
- 平台适配文件优先被 `src/scratch/instance.js` 或 `src/patches/` 导入，不应被 `blocks/groups` 直接引用。

## 六、验证结果

结构调整完成后，已执行以下验证：

```bash
npm run lint:type   # tsc --noEmit -p ./tsconfig.json，通过，exit 0
npm run build       # tsup，通过，生成 dist/index.global.js（2.78 MB）
```

## 七、遗留问题

- `src/utils` 目录在文件系统中仍有残留，但当前为空且无法访问。由于权限限制，本次未能彻底删除该目录。建议开发者在具备权限的终端下手动执行：

  ```powershell
  Remove-Item -Path "src/utils" -Recurse -Force
  ```

  该残留目录不影响 `tsc` 类型检查与 `tsup` 构建结果。
