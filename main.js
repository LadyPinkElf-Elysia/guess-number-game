import { CLASSIC_MAP, BASE_MAP, RATE_MAP, PURPLE_RATE, HISTORY_MAX, AUDIO_SRC, IMAGE_SRC, ELYSIA_IMAGE_SRC, CLASSIC_IMG, GAME_DEFAULTS } from './config.js'
import { loadRecord, saveRecord } from './utils/storage.js'
import { strNumToBool, getTarget, getResult } from './utils/gameLogic.js'

const { createApp: myApp } = Vue

/**
 * 猜数字游戏主组件
 *
 * ─── 数据属性概览 ────────────────────────────────────────────
 *  constants   : 游戏常量（经典映射、基础得分、资源路径等）
 *  customMap   : 自定义模式临时配置
 *  game        : 游戏核心数据（模式、数据、状态、提示）
 *  Music       : 音乐播放状态
 *  Image       : 背景图片状态
 *  panel       : 面板显示控制
 *  history     : 历史记录与回放
 *  settingMap  : 设置界面临时配置
 *
 * ─── 计算属性概览 ────────────────────────────────────────────
 *  scores            : 当前得分明细
 *  scoreTable        : 不同尝试次数的得分表
 *  gameName          : 动态游戏名称
 *  isConfirmDisabled : 提交按钮禁用状态
 *  remainingHints    : 剩余提示次数
 *
 * ─── 方法概览 ────────────────────────────────────────────────
 *  ─── 资源预加载 ────────────────────────────────────────────
 *  preloadImages()   → 预加载所有图片资源
 *  preloadImg(SRC)   → 预加载指定图片资源
 *
 *  ─── 数据重置 ──────────────────────────────────────────────
 *  resetData()       → 重置对象为默认值（深拷贝）
 *  clearGame()       → 清空游戏所有状态
 *  clearRecord()     → 清空历史记录（锁定项保留）
 *
 *  ─── 游戏控制 ──────────────────────────────────────────────
 *  startGame()       → 开始新游戏
 *  showPanel(name)   → 切换到指定面板
 *
 *  ─── 模式选择 ──────────────────────────────────────────────
 *  chooseMode()      → 选择经典/自定义模式
 *  setGameClassic()  → 设置经典模式难度
 *  setGameCustom()   → 设置自定义模式参数
 *  setGameData()     → 统一设置游戏数据
 *
 *  ─── 输入处理 ──────────────────────────────────────────────
 *  onInputGame()     → 限制输入框只允许数字
 *  onInputSettings() → 限制历史记录最大值为数字
 *
 *  ─── 核心游戏逻辑 ──────────────────────────────────────────
 *  guess()           → 提交猜测，判断胜负
 *
 *  ─── 提示系统 ──────────────────────────────────────────────
 *  showPosHint()     → 显示指定位置的数字提示
 *
 *  ─── 作弊键（开发辅助）────────────────────────────────────
 *  cheatKey()        → 注册作弊键（按 s 显示答案）
 *  removeCheatKey()  → 移除作弊键监听
 *
 *  ─── 记录管理 ──────────────────────────────────────────────
 *  addRecord()       → 添加当前游戏记录到历史
 *  openReplay()      → 打开回放面板
 *  switchLock()      → 切换记录的锁定状态
 *
 *  ─── 音画设置 ──────────────────────────────────────────────
 *  playAudio()       → 播放/暂停背景音乐
 *  playImage()       → 更换背景图片
 *  setBgAudio()      → 上传自定义音频文件
 *  setBgImage()      → 上传自定义图片文件
 *
 * @example
 * // 在 HTML 中挂载
 * <div id="app"></div>
 * // 组件将自动渲染
 */
myApp({
    data() {
        return {
            constants: {
                classicMap: CLASSIC_MAP,
                baseMap: BASE_MAP,
                audioSrc: AUDIO_SRC,
                imageSrc: IMAGE_SRC,
                elysiaImgSrc: ELYSIA_IMAGE_SRC,
                classicImgSrc: CLASSIC_IMG,
                purpleRate: PURPLE_RATE,
            },

            customMap: {
                len: '4',
                repeat: '0',
                purple: '0',
                max: '10',
            },

            game: {
                mode: { ...GAME_DEFAULTS.mode },
                data: { ...GAME_DEFAULTS.data },
                state: { ...GAME_DEFAULTS.state },
                hint: { ...GAME_DEFAULTS.hint },
            },

            Music: {
                index: '1',
                isPlaying: false,
                src: AUDIO_SRC['1'].src,
                customSrc: '',
            },

            Image: {
                index: '1',
                src: IMAGE_SRC['1'].src,
            },

            panel: {
                mode: false,
                game: false,
                score: false,
                replay: false,
                settings: false,
                loading: true,
            },

            history: {
                recent: [],
                replay: {},
            },

            settingMap: {
                historyMax: HISTORY_MAX,
                setDynamic: false,
                setAudio: false,
                setImage: false,
                font: {
                    size: '16',
                    style: 'default',
                    color: '#ff1493',
                },
            },

            fontStyleMap: {
                'default': "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif",
                'songti': "SimSun, '宋体', serif",
                'heiti': "SimHei, '黑体', sans-serif",
                'kaiti': "KaiTi, '楷体', serif",
                'lishu': "LiSu, '隶书', serif",
                'xingkai': "'STXingkai', '华文行楷', cursive",
                'fangsong': "FangSong, '仿宋', serif",
            },
        }
    },

    created() {
        try {
            this.history.recent = loadRecord();
        } catch (e) {
            console.error('战绩加载失败，已重置:', e);
            this.history.recent = [];
            localStorage.removeItem('RecentGames');
        }
        this.applyFont();

        this.preloadImages();
    },

    computed: {
        /**
         * 计算当前游戏的得分明细
         * 基于位数、重复、紫色、尝试次数等参数，计算基础分、紫色加成、尝试加成及最终得分。
         * @returns {Object} 得分对象
         * @property {number} base      - 基础分
         * @property {number} repeat    - 重复加成（若有）
         * @property {number} purple    - 紫色加成（若未启用紫色则为0）
         * @property {number} attempt   - 尝试次数加成
         * @property {number} ratio     - 总加成（紫色+尝试）
         * @property {number} final     - 最终得分
         */
        scores() {
            const { Len: len, Repeat: rep, Purple: pur, Max: max } = this.game.data;
            const base = BASE_MAP[len][rep];
            const repeatBonus = BASE_MAP[len][true] - BASE_MAP[len][false];
            const purpleBonus = Math.round(base * PURPLE_RATE);
            const purScore = pur ? 0 : purpleBonus;
            const attemptScore = Math.round(base * RATE_MAP[max]);
            const ratio = purScore + attemptScore;
            const final = base + ratio;
            return { base, repeat: repeatBonus, purple: purpleBonus, attempt: attemptScore, ratio, final };
        },

        /**
         * 生成得分表，展示不同尝试次数对应的得分率与得分。
         * @returns {Object.<string, {rate: number, score: number}>}
         */
        scoreTable() {
            const data = this.game['data'];
            const base = BASE_MAP[data.Len][data.Repeat];
            const table = {};
            for (const [key, rate] of Object.entries(RATE_MAP)) {
                table[key] = {
                    rate,
                    score: Math.round(base * rate),
                };
            }
            return table;
        },

        /**
         * 动态生成当前游戏的名称（如 "经典-简单" 或 "自定义4位"）。
         * @returns {string}
         */
        gameName() {
            const mode = this.game['mode'];
            const data = this.game['data'];
            if (mode.Mode === 'classic' && mode.Level) {
                return `经典-${CLASSIC_MAP[mode.Level].name}`;
            }
            if (mode.Mode === 'custom') {
                return `自定义${data.Len}位`;
            }
            return `经典-${CLASSIC_MAP.easy.name}`;
        },

        /**
         * 判断“提交”按钮是否禁用。
         * 当游戏已结束或输入位数不符合要求时禁用。
         * @returns {boolean}
         */
        isConfirmDisabled() {
            const state = this.game['state'];
            const data = this.game['data'];
            if (state.Win || state.Lost) return true;
            return state.Input.length !== data.Len;
        },

        /**
         * 计算剩余提示次数。
         * @returns {number}
         */
        remainingHints() {
            const hint = this.game['hint'];
            return hint.max - hint.used;
        },
    },

    methods: {
        // ---------- 资源预加载 ----------
        /**
         * 预加载所有图片资源（内置图片、爱莉希雅图片、经典模式图片）。
         * 在组件 created 钩子中自动调用，确保游戏过程中图片能快速显示。
         *
         * @returns {void}
         *
         * @example
         * // 组件创建时自动调用
         * this.preloadImages();
         */
        preloadImages() {
            this.preloadImg(IMAGE_SRC);
            this.preloadImg(ELYSIA_IMAGE_SRC);
            this.preloadImg(CLASSIC_IMG);
        },

        /**
         * 预加载指定资源对象中的所有图片。
         * 通过创建 Image 对象并设置 src 属性触发浏览器预加载机制，
         * 确保图片资源能够被提前加载到浏览器缓存中。
         *
         * @param {Object.<string, {src: string}>} SRC - 图片资源对象，值包含 src 属性
         * @returns {void}
         *
         * @example
         * // 预加载所有内置图片
         * this.preloadImg(IMAGE_SRC);
         */
        preloadImg(SRC) {
            Object.values(SRC).forEach(item => {
                const img = new Image();
                img.src = item.src;
            });
        },

        // ---------- 数据重置 ----------
        /**
         * 重置目标对象为给定的默认值（深拷贝），清空原有属性。
         * 使用 structuredClone 进行深拷贝，避免引用共享问题。
         * 该方法是所有重置操作的基础工具。
         *
         * @param {Object} target   - 要重置的对象（如 this.game.state）
         * @param {Object} defaults - 默认值对象（如 GAME_DEFAULTS.state）
         * @returns {void}
         *
         * @example
         * // 重置游戏状态为默认值
         * this.resetData(this.game.state, GAME_DEFAULTS.state);
         */
        resetData(target, defaults) {
            const cloned = structuredClone(defaults);
            for (const key in target) {
                delete target[key];
            }
            Object.assign(target, cloned);
        },

        /**
         * 清空游戏所有状态（模式、数据、状态、提示），恢复到初始默认值。
         * 遍历 game 对象的每个属性（mode/data/state/hint），
         * 调用 resetData 进行重置。
         *
         * @returns {void}
         *
         * @example
         * // 清空当前游戏状态，准备开始新游戏
         * this.clearGame();
         */
        clearGame() {
            for (const key in this.game) {
                this.resetData(this.game[key], GAME_DEFAULTS[key]);
            }
        },

        /**
         * 清空历史记录（仅删除未锁定的记录，锁定记录保留），并提供二次确认。
         * 使用 confirm 对话框确保用户确认删除操作，避免误删。
         *
         * @returns {void}
         *
         * @example
         * // 用户点击"清空记录"按钮时调用
         * this.clearRecord();
         */
        clearRecord() {
            if (!confirm('确定清空战绩？该操作不可逆 ')) {
                return;
            }
            this.history.recent = this.history.recent.filter(i => i.locked);
            saveRecord(this.history.recent);
        },

        // ---------- 游戏控制 ----------
        /**
         * 开始新游戏。
         * 重置状态和提示，生成目标数字，激活作弊键，切换到游戏面板。
         * 这是玩家点击"开始游戏"时的核心入口方法。
         *
         * @returns {void}
         *
         * @example
         * // 用户点击"开始游戏"按钮时调用
         * this.startGame();
         */
        startGame() {
            const state = this.game['state'];
            const data = this.game['data'];
            const hint = this.game['hint'];

            this.resetData(state, GAME_DEFAULTS.state);
            this.resetData(hint, GAME_DEFAULTS.hint);

            state.Target = getTarget(
                data.Len,
                data.Repeat
            );
            state.Msg = '新的一天，从一场美妙的邂逅开始♪ ';

            if (!this.cheatHandler) {
                this.cheatKey();
            } else {
                this.removeCheatKey();
                this.cheatKey();
            }

            this.showPanel('game');
        },

        /**
         * 切换面板显示（隐藏所有面板，仅显示指定面板）。
         * 当切换到非游戏面板时，自动移除作弊键监听。
         *
         * @param {string} name - 面板名称，可选值：
         *   - 'mode'    : 模式选择面板
         *   - 'game'    : 游戏面板
         *   - 'score'   : 得分面板
         *   - 'replay'  : 回放面板
         *   - 'settings': 设置面板
         * @returns {void}
         *
         * @example
         * // 切换到游戏面板
         * this.showPanel('game');
         * // 切换到设置面板
         * this.showPanel('settings');
         */
        showPanel(name) {
            for (const key in this.panel) {
                this.panel[key] = false;
            }
            this.panel[name] = true;

            if (name !== 'game') {
                this.removeCheatKey();
            }
        },

        // ---------- 模式选择 ----------
        /**
         * 选择游戏模式（经典/自定义），清空游戏并设置对应模式。
         *
         * @param {string} modeName - 模式名称，可选值：
         *   - 'classic': 经典模式（预设难度）
         *   - 'custom' : 自定义模式（玩家自设参数）
         * @returns {void}
         *
         * @example
         * // 切换到经典模式
         * this.chooseMode('classic');
         * // 切换到自定义模式
         * this.chooseMode('custom');
         */
        chooseMode(modeName) {
            const mode = this.game['mode'];

            this.clearGame();
            mode.Mode = modeName;
            if (modeName === 'classic') {
                this.setGameClassic('easy');
            }
            if (modeName === 'custom') {
                this.setGameCustom();
            }
        },

        /**
         * 设置经典模式（预设难度级别）。
         * 从 CLASSIC_MAP 中读取对应难度的配置参数。
         *
         * @param {string} level - 难度键名，可选值：
         *   - 'easy'  : 简单（4 位，不允许重复，最大尝试 10 次）
         *   - 'hard'  : 困难（6 位，不允许重复，最大尝试 10 次）
         *   - 'hell'  : 地狱（8 位，不允许重复，最大尝试 10 次）
         * @returns {void}
         *
         * @example
         * // 设置为困难模式
         * this.setGameClassic('hard');
         * // 设置为地狱模式
         * this.setGameClassic('hell');
         */
        setGameClassic(level) {
            const mode = this.game['mode'];

            const classic = CLASSIC_MAP[level];
            mode.Level = level;
            this.setGameData(classic);
        },

        /**
         * 设置自定义模式（使用 customMap 中的参数）。
         * customMap 包含玩家在设置界面填写的 len、repeat、purple、max 值。
         *
         * @returns {void}
         *
         * @example
         * // 使用当前 customMap 的值设置游戏
         * this.setGameCustom();
         */
        setGameCustom() {
            const custom = this.customMap;
            this.setGameData(custom);
        },

        /**
         * 根据模式对象设置游戏数据（Len, Repeat, Purple, Max）。
         * 将字符串类型的参数转换为对应的布尔值或数字。
         *
         * @param {Object} mode - 包含游戏参数的对象
         * @param {string|number} mode.len    - 数字位数（如 '4' 或 4）
         * @param {string|number} mode.repeat - 是否允许重复（'0'/'1' 或 0/1）
         * @param {string|number} mode.purple - 是否启用紫色数字（'0'/'1' 或 0/1）
         * @param {string|number} mode.max    - 最大尝试次数（如 '10' 或 10）
         * @returns {void}
         *
         * @example
         * // 使用经典模式配置设置游戏数据
         * this.setGameData(CLASSIC_MAP.easy);
         */
        setGameData(mode) {
            const data = this.game['data'];
            this.resetData(data, {
                Len: Number(mode.len),
                Repeat: strNumToBool(mode.repeat),
                Purple: strNumToBool(mode.purple),
                Max: Number(mode.max),
            });
        },

        // ---------- 输入处理 ----------
        /**
         * 限制输入框只允许数字，过滤非数字字符。
         * 绑定到输入框的 @input 事件，实时过滤用户输入。
         *
         * @returns {void}
         *
         * @example
         * // 在模板中绑定
         * <input @input="onInputGame" v-model="game.state.Input" />
         */
        onInputGame() {
            const state = this.game['state'];
            state.Input = state.Input.replace(/[^\d]/g, '');
        },

        /**
         * 设置历史记录最大值输入处理，限制为最多两位数字，且不能以0开头。
         * 若输入为空，则自动设为默认值 '10'。
         *
         * @returns {void}
         *
         * @example
         * // 绑定到设置面板的输入框
         * <input @input="onInputSettings" v-model="settingMap.historyMax" />
         */
        onInputSettings() {
            this.settingMap.historyMax = this.settingMap.historyMax
                .replace(/\D/g, '')
                .replace(/^0+/, '')
                .slice(0, 2);
            if (!this.settingMap.historyMax) {
                this.settingMap.historyMax = '10';
            }
        },
        /**
         * 应用字体设置（字号、字体样式、字体颜色）到整个游戏界面。
         * 通过覆盖 :root 的 CSS 变量实现：
         *   --font-size-base / --font-size-sm → 字号
         *   --font-family                      → 字体样式
         *   --pink                             → 字体颜色
         * 绑定到设置面板的字号/字体样式/字体颜色控件的 @input / @change 事件。
         *
         * @returns {void}
         *
         * @example
         * // 切换字号或字体样式或字体颜色时自动调用
         * this.applyFont();
         */
        applyFont() {
            const font = this.settingMap.font;
            const size = Number(font.size);
            const family = this.fontStyleMap[font.style] || this.fontStyleMap['default'];
            const root = document.documentElement;
            root.style.setProperty('--font-size-base', size + 'px');
            root.style.setProperty('--font-size-sm', Math.max(size - 2, 10) + 'px');
            root.style.setProperty('--font-family', family);
            root.style.setProperty('--pink', font.color);
        },

        // ---------- 核心游戏逻辑 ----------
        /**
         * 提交猜测，检查输入与目标的匹配结果，更新状态并判断胜负。
         * 若胜利或失败，则添加记录并移除作弊键。
         * 这是游戏最核心的方法，包含了完整的猜数字判断逻辑。
         *
         * @returns {void}
         *
         * @example
         * // 用户点击"提交"按钮时调用
         * this.guess();
         */
        guess() {
            const state = this.game['state'];
            const data = this.game['data'];
            const settingMap = this.settingMap;

            const { Input: input, Target: target } = state;
            const isPurple = data.Purple;
            const isDynamic = settingMap.setDynamic;
            const result = getResult(input, target, isPurple, isDynamic);
            state.List.push({
                digits: input.split(''),
                colors: result
            });
            state.Attempts++;

            if (input === target) {
                state.Win = true;
                state.Msg = `我就知道，你最棒了，答案是${state.Target}♪  `;
                this.addRecord();
                this.removeCheatKey();
            } else if (state.Attempts >= data.Max) {
                state.Lost = true;
                state.Msg = `输了也不要紧，答案是${state.Target}♪  `;
                this.addRecord();
                this.removeCheatKey();
            }
            state.Input = '';
        },

        // ---------- 提示系统 ----------
        /**
         * 显示指定位置的数字提示，更新提示使用次数和结果列表。
         * 若游戏已结束或未开始，或该位置已提示过，则给出相应消息。
         * 提示信息会显示在游戏面板的消息区域。
         *
         * @returns {void}
         *
         * @example
         * // 用户点击"提示"按钮时调用
         * this.showPosHint();
         */
        showPosHint() {
            const state = this.game['state'];
            const data = this.game['data'];
            const hint = this.game['hint'];

            if (state.Win || state.Lost) {
                state.Msg = '游戏已结束了哦♪  ';
                return;
            }
            if (state.Target === '') {
                state.Msg = '要先开始游戏哦♪  ';
                return;
            }
            const pos = Number(hint.pos);
            const num = state.Target[pos];
            const txt = `第 ${pos + 1} 位数字是：${num}哦♪ `;
            if (hint.result.includes(txt)) {
                state.Msg = '这个位置已经提示过啦，不可以让妖精爱莉重复提示哦♪ ';
                return;
            }
            hint.result.push(txt);
            hint.used++;
        },

        // ---------- 作弊键（开发辅助） ----------
        /**
         * 注册键盘事件监听，按下 's' 键弹出提示显示当前目标答案。
         * 仅用于开发调试，方便快速验证游戏逻辑。
         * 在游戏面板中自动激活，切换到其他面板时自动移除。
         *
         * @returns {void}
         *
         * @example
         * // 开始游戏时自动调用
         * this.cheatKey();
         * // 之后按键盘 's' 键即可显示答案
         */
        cheatKey() {
            if (this.cheatHandler) {
                document.removeEventListener("keydown", this.cheatHandler);
            }
            this.cheatHandler = (e) => {
                if (e.key === 's') {
                    e.preventDefault();
                    alert(`答案是：${this.game['state'].Target} ✅`);
                }
            };
            document.addEventListener("keydown", this.cheatHandler);
        },

        /**
         * 移除作弊键的事件监听。
         * 在游戏结束或切换到非游戏面板时调用，防止在非游戏状态下误触。
         *
         * @returns {void}
         *
         * @example
         * // 游戏结束时自动调用
         * this.removeCheatKey();
         */
        removeCheatKey() {
            if (this.cheatHandler) {
                document.removeEventListener("keydown", this.cheatHandler);
                this.cheatHandler = null;
            }
        },

        // ---------- 记录管理 ----------
        /**
         * 将当前游戏结果添加到历史记录，并根据锁状态和最大值截取记录列表，保存到本地。
         * 锁定状态的记录不会被自动截取删除。
         *
         * @returns {void}
         *
         * @example
         * // 游戏胜利或失败时自动调用
         * this.addRecord();
         */
        addRecord() {
            const state = this.game['state'];
            const data = this.game['data'];
            const hint = this.game['hint'];
            const recent = this.history.recent;
            const settings = this.settingMap;

            recent.unshift({
                gameName: this.gameName,
                attempt: state.Attempts,
                max: data.Max,
                score: state.Win ? this.scores.final : 0,
                win: state.Win,
                list: state.List,
                locked: false,
                hint: hint.result,
            });

            const maxCount = Number(this.settingMap.historyMax);
            const locked = recent.filter(i => i.locked);
            const unlocked = recent.filter(i => !i.locked);

            if (unlocked.length > maxCount) {
                unlocked.splice(maxCount);
            }

            this.history.recent = [...locked, ...unlocked];
            saveRecord(this.history.recent);
        },

        /**
         * 打开指定记录的回放界面。
         * 将选中的历史记录赋值给 history.replay，并切换到回放面板。
         *
         * @param {Object} record - 历史记录对象，包含完整的对局信息
         * @param {string} record.gameName - 游戏名称
         * @param {number} record.attempt  - 尝试次数
         * @param {Array}  record.list     - 猜测记录列表
         * @param {Array}  record.hint     - 提示记录列表
         * @param {number} record.score    - 最终得分
         * @param {boolean} record.win     - 是否胜利
         * @returns {void}
         *
         * @example
         * // 用户点击历史记录项时调用
         * this.openReplay(historyItem);
         */
        openReplay(record) {
            this.history.replay = record;
            this.showPanel('replay');
        },

        /**
         * 切换历史记录的锁定状态，并保存。
         * 锁定的记录在清空记录和自动截取时不会被删除。
         *
         * @param {number} index - 记录在 recent 数组中的索引
         * @returns {void}
         *
         * @example
         * // 用户点击记录的锁定按钮时调用
         * this.switchLock(0); // 锁定或解锁第一条记录
         */
        switchLock(index) {
            const record = this.history.recent[index];
            record.locked = !record.locked;
            saveRecord(this.history.recent);
        },

        // ---------- 音画设置 ----------
        /**
         * 播放/暂停背景音乐。
         * 若启用自定义音频（settingMap.setAudio 为 true），
         * 则使用用户上传的音频源，否则使用内置音频。
         *
         * @returns {void}
         *
         * @example
         * // 用户点击音乐播放/暂停按钮时调用
         * this.playAudio();
         */
        playAudio() {
            const audio = this.$refs.bgm;
            const i = this.Music.index;
            let src;
            if (!this.settingMap.setAudio) {
                src = AUDIO_SRC[i].src;
            } else {
                src = this.Music.customSrc;
            }

            if (!src) {
                alert('请选择有效音频❗');
                return;
            }

            if (!audio.paused) {
                audio.pause();
                this.Music.isPlaying = false;
            } else {
                audio.src = src;
                audio.load();
                audio.play();
                this.Music.isPlaying = true;
            }
        },

        /**
         * 更换背景图片，将所有 .panel 元素的背景图设置为选中的图片。
         *
         * @returns {void}
         *
         * @example
         * // 用户选择内置图片时调用
         * this.playImage();
         */
        playImage() {
            const i = this.Image.index;
            const src = IMAGE_SRC[i].src;
            const panels = document.querySelectorAll('.panel');
            panels.forEach(panel => {
                panel.style.backgroundImage = `url(${src})`;
            });
        },

        /**
         * 处理用户上传自定义音频文件，生成临时 URL 并存储。
         * 仅接受音频格式文件（audio/*），否则弹出提示。
         * 生成的临时 URL 存储在 `Music.customSrc` 中，刷新页面后失效。
         *
         * @param {Event} e - 文件输入框的 change 事件，通过 `e.target.files[0]` 获取用户选择的音频文件
         * @returns {void}
         *
         * @example <caption>在模板中绑定</caption>
         * ```html
         * <input type="file" accept="audio/*" v-on:change="setBgAudio" />
         * ```
         */
        setBgAudio(e) {
            const file = e.target.files?.[0];
            if (!file || !file.type.startsWith('audio/')) {
                alert("请选择有效音频❗");
                return;
            }
            this.Music.customSrc = URL.createObjectURL(file);
            this.Music.isPlaying = false;
        },

        /**
         * 处理用户上传自定义图片文件，读取为 Data URL 并应用为背景。
         * 仅接受图片格式文件（image/*），否则弹出提示。
         * 使用 FileReader 读取文件内容，读取完成后自动应用到所有 `.panel` 元素。
         *
         * @param {Event} e - 文件输入框的 change 事件，通过 `e.target.files[0]` 获取用户选择的图片文件
         * @returns {void}
         *
         * @example <caption>在模板中绑定</caption>
         * ```html
         * <input type="file" accept="image/*" v-on:change="setBgImage" />
         * ```
         */
        setBgImage(e) {
            const file = e.target.files?.[0];
            if (!file || !file.type.startsWith('image/')) {
                alert("请选择有效图片❗");
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const imgUrl = reader.result;
                const panels = document.querySelectorAll('.panel');
                panels.forEach(panel => {
                    panel.style.backgroundImage = `url(${imgUrl})`;
                });
            };
            reader.readAsDataURL(file);
        },
    }

}).mount('#app')