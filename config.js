/**
 * ================================================================
 *  🎮  猜数字游戏 —— 配置文件
 *  集中管理游戏的所有常量、映射表、资源路径及默认值。
 *  修改此文件即可调整游戏难度、得分规则、资源引用等。
 * ================================================================
 */

/**
 * 经典模式预设配置
 * 键为难度名称，值为对应的游戏参数。
 *
 * @type {Object.<string, {name: string, len: string, repeat: string, purple: string, max: string}>}
 * @property {string} name   - 难度显示名称
 * @property {string} len    - 数字位数
 * @property {string} repeat - 是否允许重复（'0'=否, '1'=是）
 * @property {string} purple - 是否启用紫色数字（'0'=否, '1'=是）
 * @property {string} max    - 最大尝试次数
 */
export const CLASSIC_MAP = {
    'easy': { 'name': '简单', 'len': '4', 'repeat': '0', 'purple': '0', 'max': '10', },
    'hard': { 'name': '困难', 'len': '6', 'repeat': '0', 'purple': '0', 'max': '10', },
    'hell': { 'name': '地狱', 'len': '8', 'repeat': '0', 'purple': '0', 'max': '10', },
}

/**
 * 基础得分映射表
 * 根据数字位数和是否允许重复，确定基础分。
 *
 * @type {Object.<number, {false: number, true: number}>}
 * @property {number} false - 不允许重复时的基础分
 * @property {number} true  - 允许重复时的基础分
 */
export const BASE_MAP = {
    4: { false: 35, true: 40 },
    6: { false: 50, true: 60 },
    8: { false: 65, true: 80 },
    10: { false: 80, true: 100 },
}

/**
 * 尝试次数得分率映射表
 * 键为尝试次数，值为对应的得分率（用于计算尝试加成）。
 * 尝试次数越少，得分率越高。
 *
 * @type {Object.<number, number>}
 */
export const RATE_MAP = {
    4: 0.30, 5: 0.25, 6: 0.20, 7: 0.15, 8: 0.10, 9: 0.05, 10: 0.00,
}

/**
 * 紫色数字加成率
 * 当游戏启用紫色数字时，基础分将乘以 (1 + PURPLE_RATE)。
 *
 * @type {number}
 */
export const PURPLE_RATE = 0.20

/**
 * 历史记录最大保存条数
 * 超过此数量的未锁定记录将被自动清除。
 *
 * @type {number}
 */
export const HISTORY_MAX = 10

// ================================================================
//  音画资源配置
// ================================================================
//  ════════════════════════════════════════════════════════════════
//  📌 使用说明：
//  当前生效的是【相对路径方案】（使用本地 music/ 和 img/ 目录）
//  如需切换为 CDN，请取消下方 CDN 部分的注释，并注释掉相对路径部分。
//  ════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════
//  🔗 方案一：CDN 远程资源（通过 jsDelivr 加速）
//    适用于 GitHub Pages 部署，资源托管在仓库中。
//    优点：无需携带大量媒体文件，仓库体积小。
// ════════════════════════════════════════════════════════════════
// export const AUDIO_SRC = {
//     '1': { 'name': '蝶恋花', 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/music/蝶恋花.ogg" },
//     '2': { 'name': '世末歌者', 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/music/世末歌者.ogg" },
//     '3': { 'name': '千本樱', 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/music/千本樱.mp3" },
//     '4': { 'name': '大荒寻梦录', 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/music/大荒寻梦录.mp3" },
//     '5': { 'name': '群青', 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/music/群青.ogg" },
//     '6': { 'name': '浴火重生', 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/music/浴火重生.ogg" },
//     '7': { 'name': '英雄出征', 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/music/英雄出征.ogg" },
//     '8': { 'name': '非人哉', 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/music/非人哉.mp3" },
//     '9': { 'name': '熙熙攘攘我们的城市', 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/music/熙熙攘攘我们的城市.mp3" },
//     '10': { 'name': '红昭愿', 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/music/红昭愿.mp3" },
//     '11': { 'name': '我的悲伤是水做的', 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/music/我的悲伤是水做的.ogg" },
//     '12': { 'name': 'TruE', 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/music/TruE.mp3" },
// }

// export const IMAGE_SRC = {
//     '1': { 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/img/小奥-希望人没事.png" },
//     '2': { 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/img/大眼七夕封面.png" },
//     '3': { 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/img/小诗.png" },
//     '4': { 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/img/小诗心链.png" },
//     '5': { 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/img/尼娅.png" },
//     '6': { 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/img/啥乌.png" },
//     '7': { 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/img/洛天依.png" },
//     '8': { 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/img/游乐园小诗.png" },
//     '9': { 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/img/落水爱莉.png" },
//     '10': { 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/img/粉色乐土.png" },
// }

// export const ELYSIA_IMAGE_SRC = {
//     '1': { 'name': "加载中...", 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/elysiaImg/爱莉揣小手.png" },
//     '2': { 'name': "经典模式", 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/elysiaImg/爱莉2.png" },
//     '3': { 'name': "自定义模式", 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/elysiaImg/爱莉9.png" },
//     '4': { 'name': "游戏规则", 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/elysiaImg/爱莉.png" },
//     '5': { 'name': "游戏提示", 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/elysiaImg/爱莉10.png" },
//     '6': { 'name': "游戏胜利", 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/elysiaImg/爱莉点赞.png" },
//     '7': { 'name': "游戏失败", 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/elysiaImg/爱莉游戏失败.png" },
//     '8': { 'name': "游戏回放", 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/elysiaImg/爱莉翻花绳.png" },
// }

// export const CLASSIC_IMG = {
//     'easy': { 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/elysiaImg/爱莉3.png" },
//     'hard': { 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/elysiaImg/爱莉4.png" },
//     'hell': { 'src': "https://cdn.jsdelivr.net/gh/ladypinkelf-elysia/guess-number-game/elysiaImg/爱莉8.png" },
// }

// ════════════════════════════════════════════════════════════════
//  📁 方案二：本地相对路径资源（当前生效）
//    适用于本地开发或自托管，资源存放在项目目录中。
//    优点：不依赖外部 CDN，离线也能运行。
// ════════════════════════════════════════════════════════════════

/**
 * 背景音乐资源映射表（本地相对路径）
 * 键为音乐编号，值为音乐名称和路径。
 *
 * @type {Object.<string, {name: string, src: string}>}
 * @property {string} name - 音乐显示名称
 * @property {string} src  - 音乐文件路径（支持 .mp3 / .ogg 等格式）
 */
export const AUDIO_SRC = {
    '1': { 'name': '蝶恋花', 'src': "./music/蝶恋花.ogg" },
    '2': { 'name': '世末歌者', 'src': "./music/世末歌者.ogg" },
    '3': { 'name': '千本樱', 'src': "./music/千本樱.mp3" },
    '4': { 'name': '大荒寻梦录', 'src': "./music/大荒寻梦录.mp3" },
    '5': { 'name': '群青', 'src': "./music/群青.ogg" },
    '6': { 'name': '浴火重生', 'src': "./music/浴火重生.ogg" },
    '7': { 'name': '英雄出征', 'src': "./music/英雄出征.ogg" },
    '8': { 'name': '非人哉', 'src': "./music/非人哉.mp3" },
    '9': { 'name': '熙熙攘攘我们的城市', 'src': "./music/熙熙攘攘我们的城市.mp3" },
    '10': { 'name': '红昭愿', 'src': "./music/红昭愿.mp3" },
    '11': { 'name': '我的悲伤是水做的', 'src': "./music/我的悲伤是水做的.ogg" },
    '12': { 'name': 'TruE', 'src': "./music/TruE.mp3" },
}

/**
 * 背景图片资源映射表（本地相对路径）
 * 键为图片编号，值为图片路径。
 *
 * @type {Object.<string, {src: string}>}
 * @property {string} src - 图片文件路径
 */
export const IMAGE_SRC = {
    '1': { 'src': "./img/小奥-希望人没事.png" },
    '2': { 'src': "./img/大眼七夕封面.png" },
    '3': { 'src': "./img/小诗.png" },
    '4': { 'src': "./img/小诗心链.png" },
    '5': { 'src': "./img/尼娅.png" },
    '6': { 'src': "./img/啥乌.png" },
    '7': { 'src': "./img/洛天依.png" },
    '8': { 'src': "./img/游乐园小诗.png" },
    '9': { 'src': "./img/落水爱莉.png" },
    '10': { 'src': "./img/粉色乐土.png" },
}

/**
 * 爱莉希雅主题图片资源映射表（本地相对路径）
 * 用于游戏各面板和状态展示。
 *
 * @type {Object.<string, {name: string, src: string}>}
 * @property {string} name - 图片用途描述
 * @property {string} src  - 图片文件路径
 */
export const ELYSIA_IMAGE_SRC = {
    '1': { 'name': "加载中...", 'src': "./elysiaImg/爱莉揣小手.png" },
    '2': { 'name': "经典模式", 'src': "./elysiaImg/爱莉2.png" },
    '3': { 'name': "自定义模式", 'src': "./elysiaImg/爱莉9.png" },
    '4': { 'name': "游戏规则", 'src': "./elysiaImg/爱莉.png" },
    '5': { 'name': "游戏提示", 'src': "./elysiaImg/爱莉10.png" },
    '6': { 'name': "游戏胜利", 'src': "./elysiaImg/爱莉点赞.png" },
    '7': { 'name': "游戏失败", 'src': "./elysiaImg/爱莉游戏失败.png" },
    '8': { 'name': "游戏回放", 'src': "./elysiaImg/爱莉翻花绳.png" },
}

/**
 * 经典模式各难度对应的爱莉希雅主题图片（本地相对路径）
 *
 * @type {Object.<string, {src: string}>}
 * @property {string} src - 图片文件路径
 */
export const CLASSIC_IMG = {
    'easy': { 'src': "./elysiaImg/爱莉3.png" },
    'hard': { 'src': "./elysiaImg/爱莉4.png" },
    'hell': { 'src': "./elysiaImg/爱莉8.png" },
}

// ================================================================
//  游戏默认状态
//  用于初始化或重置游戏时还原到初始状态。
// ================================================================

/**
 * 游戏默认值配置
 * 包含模式、数据、状态、提示的初始值。
 * 所有游戏重置操作都基于此配置。
 *
 * @type {Object}
 * @property {Object} mode  - 游戏模式默认值
 * @property {string} mode.Mode  - 模式类型（'classic' | 'custom'）
 * @property {string} mode.Level - 难度等级（'easy' | 'hard' | 'hell' | ''）
 * @property {string} mode.Name  - 模式显示名称
 *
 * @property {Object} data  - 游戏数据默认值
 * @property {number} data.Len    - 数字位数
 * @property {boolean} data.Repeat - 是否允许重复
 * @property {boolean} data.Purple - 是否启用紫色数字
 * @property {number} data.Max    - 最大尝试次数
 *
 * @property {Object} state - 游戏状态默认值
 * @property {string}  state.Input   - 当前输入
 * @property {string}  state.Target  - 目标数字
 * @property {number}  state.Attempts - 已尝试次数
 * @property {Array}   state.List    - 猜测记录列表
 * @property {string}  state.Msg     - 消息提示
 * @property {boolean} state.Win     - 是否胜利
 * @property {boolean} state.Lost    - 是否失败
 *
 * @property {Object} hint  - 提示系统默认值
 * @property {string} hint.pos    - 当前提示位置
 * @property {number} hint.used   - 已使用提示次数
 * @property {number} hint.max    - 最大提示次数
 * @property {Array}  hint.result - 提示结果列表
 */
export const GAME_DEFAULTS = {
    'mode': {
        Mode: 'classic',
        Level: '',
        Name: '简单'
    },
    'data': {
        Len: 4,
        Repeat: false,
        Purple: false,
        Max: 10,
    },
    'state': {
        Input: '',
        Target: '',
        Attempts: 0,
        List: [],
        Msg: '',
        Win: false,
        Lost: false,
    },
    'hint': {
        pos: '0',
        used: 0,
        max: 2,
        result: [],
    },
}