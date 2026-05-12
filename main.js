import { CLASSIC_MAP, BASE_MAP, RATE_MAP, PURPLE_RATE, AUDIO_SRC, IMAGE_SRC, ELYSIA_IMAGE_SRC, CLASSIC_IMG, GAME_DEFAULTS } from './config.js'
import { loadRecord, saveRecord } from './utils/storage.js'
import { strNumToBool, getTarget, getResult } from './utils/gameLogic.js'

const { createApp: myApp } = Vue

myApp({
    data() {
        return {
            classicMap: CLASSIC_MAP,
            baseMap: BASE_MAP,
            rateMap: RATE_MAP,
            audioSrc: AUDIO_SRC,
            imageSrc: IMAGE_SRC,
            elysiaImgSrc: ELYSIA_IMAGE_SRC,
            classicImgSrc: CLASSIC_IMG,
            purpleRate: PURPLE_RATE,                //引用只读常量

            customMap: { 
                'len': '4', 
                'repeat': '0', 
                'purple': '0', 
                'max': '10', 
            },                                      //自定义模式的临时存储对象

            game: {
                'mode': { ...GAME_DEFAULTS.mode },
                'data': { ...GAME_DEFAULTS.data },
                'state': { ...GAME_DEFAULTS.state },
                'hint': { ...GAME_DEFAULTS.hint },
            },                                      //游戏的核心数据对象，包含模式、数据、状态和提示信息

            Music: {                                //音乐相关状态
                index: '1',
                isPlaying: false,
                src: AUDIO_SRC['1'].src,
                customSrc: '',
            },
            Image: {                                //图片相关状态
                index: '1',
                src: IMAGE_SRC['1'].src,
            },

            panel: {                                //界面显示状态
                mode: false,
                game: false,
                score: false,
                replay: false,
                settings: false,
                loading: true,
            },

            history: {                              //游戏历史记录，包含最近的战绩和当前回放的对局数据
                'recent': [],   
                'replay': {}     
            },

            settingMap: {                           //设置界面的临时存储对象，包含历史记录最大值和是否启用动态提示  
                'dynamic': '0',
                'historyMax': 10,
                'setAudio': false,
                'setImage': false,
            },

        }
    },

    created() {
        try {
            this.history.recent = loadRecord();
        } catch (e) {
            console.error('战绩加载失败，已重置:', e);
            this.history.recent = [];
            // 可选：清除损坏的数据
            localStorage.removeItem('RecentGames');
        }

        this.preloadImages();
    },

    computed: {
        //计算当前游戏的得分情况，基于游戏数据和状态进行综合评估，提供给玩家明确的得分信息和激励机制
        scores() {                  
            const { Len: len, Repeat: rep, Purple: pur, Max: max } = this.game.data;
            const base = BASE_MAP[len][rep];

            const repeatBonus = BASE_MAP[len][true] - BASE_MAP[len][false];
            const purpleBonus = Math.round(base * PURPLE_RATE);
            const purScore = pur ? 0 : purpleBonus;

            const attemptScore = Math.round(base * RATE_MAP[max]);
            const ratio = purScore + attemptScore;
            const final = base + ratio;

            return {
                base,
                repeat: repeatBonus,
                purple: purpleBonus,
                attempt: attemptScore,
                ratio,
                final,
            };
        },
        //计算当前游戏的得分表，展示不同尝试次数对应的得分情况，供玩家参考
        scoreTable() {              
            const base = BASE_MAP[this.game.data.Len][this.game.data.Repeat];
            const table = {};

            for (const [key, rate] of Object.entries(RATE_MAP)) {
                table[key] = {
                    rate,
                    score: Math.round(base * rate),
                };
            }

            return table;
        },
        //计算当前游戏的名称，基于游戏模式和数据进行动态生成，提供给玩家明确的游戏类型信息
        gameName() {                
            const mode = this.game['mode'];
            const data = this.game['data'];

            if (mode.Mode === 'classic' && mode.Level) {
                return CLASSIC_MAP[mode.Level].name;
            }
            if (mode.Mode === 'custom') {
                return `自定义${data.Len}位`;
            }
            return CLASSIC_MAP.easy.name;
        },
        //计算提交按钮是否应该被禁用，基于当前游戏状态和输入数据的完整性进行判断，确保玩家只能在有效输入时提交猜测
        isConfirmDisabled() {           
            const state = this.game['state'];
            const data = this.game['data'];

            if (state.Win || state.Lost) {
                return true
            }
            return state.Input.length !== data.Len;
        },
        //计算玩家剩余的提示次数，基于游戏提示的使用情况和最大限制进行计算，提醒玩家合理使用提示资源
        remainingHints() {          
            const hint = this.game['hint'];
            return hint.max - hint.used;
        },

    },

    methods: {
        //预加载图片资源，提升用户体验，确保在游戏过程中图片能够快速显示，避免加载延迟带来的不适感
        preloadImages() {
            Object.values(IMAGE_SRC).forEach(item => {
                const img = new Image();
                img.src = item.src;
            });
        },
        //重置数据对象，清空目标对象的现有属性并赋予默认值，确保游戏状态能够正确初始化，避免数据残留导致的错误
        resetData(target, defaults) {
            const cloned = structuredClone(defaults);
            for (const key in target) {
                delete target[key];
            }
            Object.assign(target, cloned);
        },
        
        //清空游戏状态，重置游戏模式、数据、状态和提示信息为默认值，为新游戏做好准备，确保玩家每次开始游戏时都能有一个干净的状态
        clearGame() {
            this.resetData(this.game['mode'], GAME_DEFAULTS.mode);
            this.resetData(this.game['data'], GAME_DEFAULTS.data);
            this.resetData(this.game['state'], GAME_DEFAULTS.state);
            this.resetData(this.game['hint'], GAME_DEFAULTS.hint);
        },
        //清空战绩，提供给玩家明确的操作确认，确保数据安全
        clearRecord() {
            if (!confirm('确定清空战绩？该操作不可逆 ')) {
                return;
            }
            this.history.recent = this.history.recent.filter(i => i.locked);
            saveRecord(this.history.recent);
        },
        //开始游戏，初始化游戏状态和提示信息，为玩家提供新的游戏体验
        startGame() {
            this.resetData(this.game['state'], GAME_DEFAULTS.state);
            this.resetData(this.game['hint'], GAME_DEFAULTS.hint);
            this.game['state'].Target = getTarget(
                this.game['data'].Len,
                this.game['data'].Repeat
            );
            this.game['state'].Msg = '新的一天，从一场美妙的邂逅开始♪ ';

            if (!this.cheatHandler) {
                this.cheatKey();
            } else {
                this.removeCheatKey();
                this.cheatKey();
            }

            this.showPanel('game');
        },
        //显示指定面板，控制界面显示状态，确保玩家能够在不同的游戏阶段看到相应的界面内容
        showPanel(name) {
            for (const key in this.panel) {
                this.panel[key] = false;
            }
            this.panel[name] = true;

            if (name !== 'game') {
                this.removeCheatKey();
            }
        },
        //选择游戏模式，设置当前游戏的模式和相关数据，为玩家提供不同的游戏体验和挑战
        chooseMode(modeName) {
            this.clearGame();
            this.game['mode'].Mode = modeName;
            if (modeName === 'classic') {
                this.setGameClassic('easy');//默认值
            }
            if (modeName === 'custom') {
                this.setGameCustom();
            }
        },
        //设置经典模式，基于选择的难度级别配置游戏数据，为玩家提供预设的经典游戏体验
        setGameClassic(level) {
            const classic = CLASSIC_MAP[level];
            this.game['mode'].Level = level;
            this.setGameData(classic);
        },
        //设置自定义模式，基于玩家的输入配置游戏数据，为玩家提供个性化的游戏体验
        setGameCustom() {
            const custom = this.customMap;
            this.setGameData(custom);
        },
        //设置游戏数据，根据传入的游戏模式配置相应的数据项
        setGameData(mode) {
            this.game['data'].Len = Number(mode.len);
            this.game['data'].Repeat = strNumToBool(mode.repeat);
            this.game['data'].Purple = strNumToBool(mode.purple);
            this.game['data'].Max = Number(mode.max);
        },
        //输入处理，确保玩家输入的有效性和格式正确，提供即时的输入反馈，提升用户体验
        onInputGame() {
            this.game['state'].Input = this.game['state'].Input.replace(/[^\d]/g, '');
        },
        //设置历史记录最大值输入处理，确保玩家输入的有效性和合理范围，提供即时的输入反馈，提升用户体验
        onInputSettings() {
            this.settingMap.historyMax = this.settingMap.historyMax
                .replace(/\D/g, '')
                .replace(/^0+/, '')
                .slice(0, 2);
            if (!this.settingMap.historyMax) {
                this.settingMap.historyMax = '10';
            }
        },
        //猜测处理，基于玩家的输入进行游戏逻辑判断，更新游戏状态和提示信息，提供即时的反馈，提升游戏体验
        guess() {
            const input = this.game['state'].Input;
            const target = this.game['state'].Target;
            const isPurple = this.game['data'].Purple;
            const isDynamic = strNumToBool(this.settingMap.dynamic);
            const result = getResult(input, target, isPurple, isDynamic);
            this.game['state'].List.push({
                digits: input.split(''),
                colors: result
            });
            this.game['state'].Attempts++;

            if (input === target) {
                this.game['state'].Win = true;
                this.game['state'].Msg = `我就知道，你最棒了，答案是${this.game['state'].Target}♪  `;
                this.addRecord();
                this.removeCheatKey();
            } else if (this.game['state'].Attempts >= this.game['data'].Max) {
                this.game['state'].Lost = true;
                this.game['state'].Msg = `输了也不要紧，答案是${this.game['state'].Target}♪  `;
                this.addRecord();
                this.removeCheatKey();
            }
            this.game['state'].Input = '';
        },
        //显示位置提示，基于玩家的请求提供特定位置的数字提示，更新游戏状态和提示信息，确保玩家能够合理使用提示资源，提升游戏体验
        showPosHint() {
            if (this.game['state'].Win || this.game['state'].Lost) {
                this.game['state'].Msg = '游戏已结束了哦♪  ';
                return;
            }
            if (this.game['state'].Target === '') {
                this.game['state'].Msg = '要先开始游戏哦♪  ';
                return;
            }
            const pos = Number(this.game['hint'].pos);
            const num = this.game['state'].Target[pos];
            const txt = `第 ${pos + 1} 位数字是：${num}哦♪ `;
            if (this.game['hint'].result.includes(txt)) {
                this.game['state'].Msg = '这个位置已经提示过啦，不可以让妖精爱莉重复提示哦♪ ';
                return;
            }
            this.game['hint'].result.push(txt);
            this.game['hint'].used++;
        },
        //作弊键，用于开发调试，允许通过特定按键快速查看答案，确保开发过程的便捷性和效率
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
        //移除作弊键，确保在不需要作弊功能时能够及时清除相关事件监听，避免潜在的安全风险和游戏体验问题
        removeCheatKey() {
            if (this.cheatHandler) {
                document.removeEventListener("keydown", this.cheatHandler);
                this.cheatHandler = null;
            }
        },
        //添加游戏记录，基于当前游戏的结果和相关数据生成新的记录项，更新历史记录列表，并根据设置的最大值进行管理，确保玩家的战绩能够被合理保存和展示
        addRecord() {
            this.history.recent.unshift({
                gameName: this.gameName,
                attempt: this.game['state'].Attempts,
                max: this.game['data'].Max,
                score: this.game['state'].Win ? this.scores.final : 0,
                win: this.game['state'].Win,
                list: this.game['state'].List,
                locked: false,
                hint: this.game['hint'].result,
            });
            const maxCount = Number(this.settingMap.historyMax);
            const locked = this.history.recent.filter(i => i.locked);
            const unlocked = this.history.recent.filter(i => !i.locked);

            if (unlocked.length > maxCount) {
                unlocked.splice(maxCount);
            }

            this.history.recent = [...locked, ...unlocked];
            saveRecord(this.history.recent);
        },
        //打开回放，基于玩家选择的历史记录项展示对应的游戏回放界面，确保玩家能够回顾和分享自己的游戏过程，提升游戏的互动性和社交性
        openReplay(record) {
            this.history.replay = record;
            this.showPanel('replay');
        },
        //切换锁定状态，允许玩家锁定或解锁特定的历史记录项，更新记录的锁定状态，并保存到本地，确保玩家能够管理自己的战绩数据，提升用户体验
        switchLock(index) {
            const record = this.history.recent[index];
            record.locked = !record.locked;
            saveRecord(this.history.recent);
        },
        //播放音乐，基于当前的音乐设置选择合适的音频资源进行播放，提供给玩家个性化的音频体验，提升游戏的沉浸感和乐趣
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
        //播放图片，基于当前的图片设置选择合适的图像资源进行显示，提供给玩家个性化的视觉体验，提升游戏的沉浸感和乐趣
        playImage() {
            const i = this.Image.index;
            const src = IMAGE_SRC[i].src;
            const panels = document.querySelectorAll('.panel');
            panels.forEach(panel => {
                panel.style.backgroundImage = `url(${src})`;
            });
        },
        //设置背景音乐，允许玩家通过文件输入选择自定义的音频资源进行游戏背景音乐，提供个性化的音频体验，提升游戏的沉浸感和乐趣
        setBgAudio(e) {
            const file = e.target.files?.[0];

            if (!file || !file.type.startsWith('audio/')) {
                alert("请选择有效音频❗");
                return;
            }

            this.Music.customSrc = URL.createObjectURL(file);
            this.Music.isPlaying = false;
        },
        //设置背景图片，允许玩家通过文件输入选择自定义的图像资源进行游戏背景图片，提供个性化的视觉体验，提升游戏的沉浸感和乐趣
        setBgImage(e) {
            const file = e.target.files?.[0];//只读取一个文件

            if (!file || !file.type.startsWith('image/')) {
                alert("请选择有效图片❗");
                return;
            }

            const reader = new FileReader();//实例化一个读取器
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