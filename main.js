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
            purpleRate: PURPLE_RATE,

            customMap: { 'len': '4', 'repeat': '0', 'purple': '0', 'max': '10', },

            game: {
                'mode': { ...GAME_DEFAULTS.mode },
                'data': { ...GAME_DEFAULTS.data },
                'state': { ...GAME_DEFAULTS.state },
                'hint': { ...GAME_DEFAULTS.hint },
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
                'recent': [],   //历史战绩
                'replay': {}     //回放对局
            },

            settingMap: {
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
        isConfirmDisabled() {
            const state = this.game['state'];
            const data = this.game['data'];

            if (state.Win || state.Lost) {
                return true
            }
            return state.Input.length !== data.Len;
        },
        remainingHints() {
            const hint = this.game['hint'];
            return hint.max - hint.used;
        },

    },

    methods: {
        preloadImages() {
            Object.values(IMAGE_SRC).forEach(item => {
                const img = new Image();
                img.src = item.src;
            });
        },

        resetData(target, defaults) {
            Object.assign(target, defaults);
        },
        /*

        */
        clearGame() {
            this.resetData(this.game['mode'], GAME_DEFAULTS.mode);
            this.resetData(this.game['data'], GAME_DEFAULTS.data);
            this.resetData(this.game['state'], GAME_DEFAULTS.state);
            this.resetData(this.game['hint'], GAME_DEFAULTS.hint);
        },
        clearRecord() {
            if (!confirm('确定清空战绩？该操作不可逆 ')) {
                return;
            }
            this.history.recent = this.history.recent.filter(i => i.locked);
            saveRecord(this.history.recent);
        },
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
            }else{
                this.removeCheatKey();
                this.cheatKey();
            }

            this.showPanel('game');
        },

        showPanel(name) {
            for (const key in this.panel) {
                this.panel[key] = false;
            }
            this.panel[name] = true;

            if (name !== 'game') {
                this.removeCheatKey();
            }
        },
        /*

        */
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
        setGameClassic(level) {
            const classic = CLASSIC_MAP[level];
            this.game['mode'].Level = level;
            this.setGameData(classic);
        },
        setGameCustom() {
            const custom = this.customMap;
            this.setGameData(custom);
        },
        setGameData(mode) {
            this.game['data'].Len = Number(mode.len);
            this.game['data'].Repeat = strNumToBool(mode.repeat);
            this.game['data'].Purple = strNumToBool(mode.purple);
            this.game['data'].Max = Number(mode.max);
        },
        /*

        */
        onInputGame() {
            this.game['state'].Input = this.game['state'].Input.replace(/[^\d]/g, '');
        },
        onInputSettings() {
            this.settingMap.historyMax = this.settingMap.historyMax
                .replace(/\D/g, '')
                .replace(/^0+/, '')
                .slice(0, 2);
            if (!this.settingMap.historyMax) {
                this.settingMap.historyMax = '10';
            }
        },
        /*

        */
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
        removeCheatKey() {
            if (this.cheatHandler) {
                document.removeEventListener("keydown", this.cheatHandler);
                this.cheatHandler = null;
            }
        },

        addRecord() {
            this.history.recent.unshift({
                gameName: this.gameName,
                attempt: this.game['state'].Attempts,
                max: this.game['data'].Max,
                score: this.game['state'].Win ? this.scores.final : 0,
                win: this.game['state'].Win,
                list: this.game['state'].List,
                locked: false,
                hint:this.game['hint'].result,
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
        openReplay(record) {
            this.history.replay = record;
            this.showPanel('replay');
        },
        switchLock(index) {
            const record = this.history.recent[index];
            record.locked = !record.locked;
            saveRecord(this.history.recent);
        },

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
        playImage() {
            const i = this.Image.index;
            const src = IMAGE_SRC[i].src;
            const panels = document.querySelectorAll('.panel');
            panels.forEach(panel => {
                panel.style.backgroundImage = `url(${src})`;
            });
        },
        setBgAudio(e) {
            const file = e.target.files?.[0];

            if (!file || !file.type.startsWith('audio/')) {
                alert("请选择有效音频❗");
                return;
            }

            this.Music.customSrc = URL.createObjectURL(file);
            this.Music.isPlaying = false;
        },
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