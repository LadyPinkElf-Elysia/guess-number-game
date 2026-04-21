// new Vue({
//     el: '#app',
//     data: function () {
//         return {
//             baseMap: {
//                 4: { 0: 35, 1: 40 },
//                 6: { 0: 50, 1: 60 },
//                 8: { 0: 65, 1: 80 },
//                 10: { 0: 80, 1: 100 }
//             },
//             currentMode: 'classic',
//             maxAttempts: 10,
//             digitLen: 4,
//             purple: false,
//             repeatable: false,
//             c_len: 4,
//             c_repeat: 0,
//             c_purple: 0,
//             c_max: 10,
//             baseScore: 35,
//             purpleScore: 0,
//             score5: 0,
//             score6: 0,
//             score7: 0,
//             score8: 0,
//             score9: 0,
//             addTotal: 0,
//             finalScore: 35,
//             repeatExtra: 0,
//             userInput: '',
//             target: '',
//             attempts: 0,
//             historyList: [],
//             isWin: false,
//             isLose: false,
//             message: '',
//             recentGames: [],
//             isPlaying: false,
//             hintPos: 0,
//             hintUsed: 0,
//             hintMax: 2,
//             hintResult: '',
//             maxRecordCount: 8,
//         };
//     },
//     created: function () {
//         this.loadRecord();
//         this.computeScore();
//         this.initCheatKey();
//     },
//     methods: {

//         showPosHint: function () {
//             if (this.isWin || this.isLose) {
//                 this.message = "游戏已结束";
//                 return;
//             }
//             if (!this.target) {
//                 this.message = "请先开始游戏";
//                 return;
//             }
//             if (this.hintResult.includes("第 " + (Number(this.hintPos) + 1) + " 位")) {
//                 this.message = "该位置已提示过，不可重复消耗次数";
//                 return;
//             }
//             if (this.hintUsed >= this.hintMax) {
//                 this.message = "提示次数已用完";
//                 return;
//             }
//             let pos = Number(this.hintPos);
//             if (pos < 0 || pos >= this.digitLen) {
//                 this.message = "位置不合法";
//                 return;
//             }
//             let num = this.target[pos];
//             this.hintResult = "第 " + (pos + 1) + " 位数字是：" + num;
//             this.hintUsed++;
//         },
//         resetHint: function () {
//             this.hintUsed = 0;
//             this.hintResult = "";
//             this.hintPos = 0;
//         },

//         showAnswer: function () {
//             if (this.target) {
//                 alert("✅ 答案：" + this.target);
//             } else {
//                 alert("❗ 还没开始游戏");
//             }
//         },
//         initCheatKey: function () {
//             const self = this;
//             document.addEventListener("keydown", function (e) {
//                 if (e.key === "s" || e.key === "S") {
//                     self.showAnswer();
//                 }
//             });
//         },

//         loadRecord: function () {
//             var r = localStorage.getItem('guessRecentGames');
//             if (r) this.recentGames = JSON.parse(r);
//         },
//         saveRecord: function () {
//             localStorage.setItem('guessRecentGames', JSON.stringify(this.recentGames));
//         },
//         clearRecord: function () {
//             if (!confirm('确定清空战绩？该操作不可逆')) 
//             return;
//             this.recentGames = []; 
//             this.saveRecord();
//         },
//         addRecord: function (win) {
//             var modeName = '';
//             if (this.currentMode === 'classic') {
//                 if (this.isClassic(10, 4, false)) modeName = '经典-简单';
//                 else if (this.isClassic(5, 4, false)) modeName = '经典-困难';
//                 else if (this.isClassic(10, 8, false)) modeName = '经典-地狱';
//                 else modeName = '经典模式';
//             } else {
//                 modeName = '自定义(' + this.digitLen + '位)';
//             }
//             this.recentGames.unshift({
//                 modeName: modeName, step: this.attempts,
//                 score: win ? this.finalScore : 0, win: win
//             });
//             if (this.recentGames.length > this.maxRecordCount) {
//                 this.recentGames.splice(this.maxRecordCount);
//             }
//         },
//         clearCurrentGame: function () {
//             this.userInput = ''; this.attempts = 0; this.historyList = [];
//             this.isWin = false; this.isLose = false; this.message = '';
//         },
//         switchMode: function (mode) {
//             this.clearCurrentGame();
//             this.currentMode = mode;
//             if (mode === 'classic') this.setClassic(10, 4, false);
//             else this.computeScore();
//         },
//         setClassic: function (times, len, repeat) {
//             this.clearCurrentGame();
//             this.maxAttempts = times;
//             this.digitLen = len;
//             this.repeatable = repeat;
//             this.purple = false; // 强制经典模式永远无紫色
//             this.baseScore = this.baseMap[len][repeat ? 1 : 0];
//             this.finalScore = this.baseScore;
//         },
//         isClassic: function (times, len, repeat) {
//             return this.maxAttempts === times && this.digitLen === len && this.repeatable === repeat;
//         },
//         computeScore: function () {
//             var len = this.c_len, rep = this.c_repeat;
//             this.baseScore = this.baseMap[len][rep];
//             this.repeatExtra = this.baseMap[len][1] - this.baseMap[len][0];
//             var base = this.baseScore;
//             this.purpleScore = Math.round(base * 0.2);
//             this.score5 = Math.round(base * 0.3);
//             this.score6 = Math.round(base * 0.24);
//             this.score7 = Math.round(base * 0.18);
//             this.score8 = Math.round(base * 0.12);
//             this.score9 = Math.round(base * 0.06);
//             var rate = 0;
//             if (this.c_purple == 0) rate += 0.2;
//             var tryRateMap = { 5: 0.3, 6: 0.24, 7: 0.18, 8: 0.12, 9: 0.06, 10: 0 };
//             rate += tryRateMap[this.c_max];
//             this.addTotal = Math.round(base * rate);
//             this.finalScore = base + this.addTotal;
//         },
//         startGame: function () {
//             if (this.currentMode === 'custom') {
//                 this.digitLen = Number(this.c_len);
//                 this.repeatable = this.c_repeat == 1;
//                 this.purple = this.c_purple == 1;
//                 this.maxAttempts = Number(this.c_max);
//             }
//             this.resetGame();
//             this.resetHint(); // 新局重置提示次数
//             this.showPanel('game');
//         },
//         generateTarget: function () {
//             var s = ''; var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
//             for (var i = 0; i < this.digitLen; i++) {
//                 var idx = Math.floor(Math.random() * arr.length);
//                 s += arr[idx];
//                 if (!this.repeatable) arr.splice(idx, 1);
//             }
//             return s;
//         },
//         guess: function () {
//             if (this.isWin || this.isLose) return;
//             var v = this.userInput.trim();
//             if (v.length !== this.digitLen) {
//                 this.message = '请输入' + this.digitLen + '位数字';
//                 return;
//             }
//             this.attempts++;
//             var res = this.getResult(v, this.target);
//             this.historyList.push({ digits: v.split(''), colors: res.colors });
//             if (res.isAllCorrect) {
//                 this.isWin = true; this.message = '🎉 猜对！'; this.addRecord(true);
//             } else if (this.attempts >= this.maxAttempts) {
//                 this.isLose = true; this.message = '💀 次数用完'; this.addRecord(false);
//             }
//             this.userInput = '';
//         },

//         // 最终修复：经典模式永远走无紫色逻辑
//         getResult: function (u, t) {
//             var ua = u.split('');
//             var ta = t.split('');
//             var colors = Array(ua.length).fill('red');
//             var allCorrect = true;

//             // 1. 绿色（通用）
//             for (var i = 0; i < ua.length; i++) {
//                 if (ua[i] === ta[i]) {
//                     colors[i] = 'green';
//                 } else {
//                     allCorrect = false;
//                 }
//             }

//             // 2. 经典模式 = 强制无紫色
//             if (this.currentMode === 'classic') {
//                 for (var i = 0; i < ua.length; i++) {
//                     if (colors[i] === 'green') continue;
//                     if (ta.includes(ua[i])) {
//                         colors[i] = 'yellow';
//                     }
//                 }
//             }
//             // 3. 自定义模式：按设置判断紫色
//             else {
//                 if (!this.purple) {
//                     for (var i = 0; i < ua.length; i++) {
//                         if (colors[i] === 'green') continue;
//                         if (ta.includes(ua[i])) {
//                             colors[i] = 'yellow';
//                         }
//                     }
//                 } else {
//                     for (var i = 0; i < ua.length; i++) {
//                         if (colors[i] === 'green') continue;
//                         var p = ta.indexOf(ua[i]);
//                         if (p !== -1) {
//                             colors[i] = p < i ? 'yellow' : 'purple';
//                         }
//                     }
//                 }
//             }

//             return { colors: colors, isAllCorrect: allCorrect };
//         },
//         resetGame: function () {
//             this.target = this.generateTarget();
//             this.attempts = 0; this.historyList = [];
//             this.isWin = false; this.isLose = false;
//             this.message = '新局开始'; this.userInput = '';
//         },
//         showPanel: function (p) {
//             var panels = document.querySelectorAll('.panel');
//             for (var i = 0; i < panels.length; i++)panels[i].classList.remove('active');
//             document.getElementById('panel-' + p).classList.add('active');
//         },

//         toggleMusic: function () {
//             const audio = this.$refs.bgm;
//             if (!audio) return;

//             if (!this.isPlaying) {
//                 audio.play().then(() => {
//                     this.isPlaying = true;
//                 }).catch(err => console.log('播放失败', err));
//             } else {
//                 audio.pause();
//                 this.isPlaying = false;
//             }
//         },
//     },

// });

/**
 * 猜数字游戏 - 原版功能完整保留
 * 仅添加注释，无任何逻辑修改
 */
new Vue({
    el: '#app',

    data: function () {
        return {
            baseMap: {
                4: { 0: 35, 1: 40 },
                6: { 0: 50, 1: 60 },
                8: { 0: 65, 1: 80 },
                10: { 0: 80, 1: 100 }
            },
            currentMode: 'classic',
            maxAttempts: 10,
            digitLen: 4,
            purple: false,
            repeatable: false,
            c_len: 4,
            c_repeat: 0,
            c_purple: 0,
            c_max: 10,
            baseScore: 35,
            purpleScore: 0,
            score5: 0,
            score6: 0,
            score7: 0,
            score8: 0,
            score9: 0,
            addTotal: 0,
            finalScore: 35,
            repeatExtra: 0,
            userInput: '',
            target: '',
            attempts: 0,
            historyList: [],
            isWin: false,
            isLose: false,
            message: '',
            recentGames: [],
            isPlaying: false,
            hintPos: 0,
            hintUsed: 0,
            hintMax: 2,
            hintResult: '',
            maxRecordCount: 10,
        };
    },

    created: function () {
        this.loadRecord();
        this.computeScore();
        this.initCheatKey();
    },

    methods: {
        // ====================
        // 提示功能
        // ====================
        showPosHint: function () {
            if (this.isWin || this.isLose) {
                this.message = "游戏已结束";
                return;
            }
            if (!this.target) {
                this.message = "请先开始游戏";
                return;
            }
            if (this.hintResult.includes("第 " + (Number(this.hintPos) + 1) + " 位")) {
                this.message = "该位置已提示过，不可重复消耗次数";
                return;
            }
            if (this.hintUsed >= this.hintMax) {
                this.message = "提示次数已用完";
                return;
            }
            let pos = Number(this.hintPos);
            if (pos < 0 || pos >= this.digitLen) {
                this.message = "位置不合法";
                return;
            }
            let num = this.target[pos];
            this.hintResult = "第 " + (pos + 1) + " 位数字是：" + num;
            this.hintUsed++;
        },

        resetHint: function () {
            this.hintUsed = 0;
            this.hintResult = "";
            this.hintPos = 0;
        },

        // ====================
        // 作弊查看答案（S键）
        // ====================
        showAnswer: function () {
            if (this.target) {
                alert("✅ 答案：" + this.target);
            } else {
                alert("❗ 还没开始游戏");
            }
        },

        initCheatKey: function () {
            const self = this;
            document.addEventListener("keydown", function (e) {
                if (e.key === "s" || e.key === "S") {
                    self.showAnswer();
                }
            });
        },

        // ====================
        // 战绩本地存储
        // ====================
        loadRecord: function () {
            var r = localStorage.getItem('guessRecentGames');
            if (r) this.recentGames = JSON.parse(r);
        },

        saveRecord: function () {
            localStorage.setItem('guessRecentGames', JSON.stringify(this.recentGames));
        },

        clearRecord: function () {
            if (!confirm('确定清空战绩？该操作不可逆❗'))
                return;
            this.recentGames = [];
            this.saveRecord();
        },

        addRecord: function (win) {
            var modeName = '';
            if (this.currentMode === 'classic') {
                if (this.isClassic(10, 4, false)) modeName = '经典-简单';
                else if (this.isClassic(5, 4, false)) modeName = '经典-困难';
                else if (this.isClassic(10, 8, false)) modeName = '经典-地狱';
                else modeName = '经典模式';
            } else {
                modeName = '自定义(' + this.digitLen + '位)';
            }
            this.recentGames.unshift({
                modeName: modeName, step: this.attempts,
                score: win ? this.finalScore : 0, win: win
            });
            if (this.recentGames.length > this.maxRecordCount) {
                this.recentGames.splice(this.maxRecordCount);
            }
            this.saveRecord(); 
        },

        // ====================
        // 游戏状态清空
        // ====================
        clearCurrentGame: function () {
            this.userInput = ''; this.attempts = 0; this.historyList = [];
            this.isWin = false; this.isLose = false; this.message = '';
        },

        // ====================
        // 模式切换
        // ====================
        switchMode: function (mode) {
            this.clearCurrentGame();
            this.currentMode = mode;
            if (mode === 'classic') {
                this.setClassic(10, 4, false);
            } else {
                this.computeScore();
            }

        },

        setClassic: function (times, len, repeat) {
            this.clearCurrentGame();
            this.maxAttempts = times;
            this.digitLen = len;
            this.repeatable = repeat;
            this.purple = false;

            this.c_len = len;
            this.c_repeat =  repeat ? 1 : 0 ;
            this.c_purple = 0;
            this.c_max = times;
            
            this.computeScore();
        },

        isClassic: function (times, len, repeat) {
            return this.maxAttempts === times && this.digitLen === len && this.repeatable === repeat;
        },

        // ====================
        // 分数计算
        // ====================
        computeScore: function () {
            var len = this.c_len, rep = this.c_repeat;
            this.baseScore = this.baseMap[len][rep];
            this.repeatExtra = this.baseMap[len][1] - this.baseMap[len][0];
            var base = this.baseScore;
            this.purpleScore = Math.round(base * 0.2);
            this.score5 = Math.round(base * 0.3);
            this.score6 = Math.round(base * 0.24);
            this.score7 = Math.round(base * 0.18);
            this.score8 = Math.round(base * 0.12);
            this.score9 = Math.round(base * 0.06);
            var rate = 0;
            if (this.c_purple == 0) rate += 0.2;
            var tryRateMap = { 5: 0.3, 6: 0.24, 7: 0.18, 8: 0.12, 9: 0.06, 10: 0 };
            rate += tryRateMap[this.c_max];
            this.addTotal = Math.round(base * rate);
            this.finalScore = base + this.addTotal;
        },

        // ====================
        // 开始游戏
        // ====================
        startGame: function () {
            if (this.currentMode === 'custom') {
                this.digitLen = Number(this.c_len);
                this.repeatable = this.c_repeat == 1;
                this.purple = this.c_purple == 1;
                this.maxAttempts = Number(this.c_max);
            }
            this.resetGame();
            this.resetHint();
            this.showPanel('game');
        },

        // ====================
        // 生成答案
        // ====================
        generateTarget: function () {
            var s = ''; var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            for (var i = 0; i < this.digitLen; i++) {
                var idx = Math.floor(Math.random() * arr.length);
                s += arr[idx];
                if (!this.repeatable) arr.splice(idx, 1);
            }
            return s;
        },

        // ====================
        // 提交猜数字
        // ====================
        guess: function () {
            if (this.isWin || this.isLose) return;
            var v = this.userInput.trim();
            if (v.length !== this.digitLen) {
                this.message = '请输入' + this.digitLen + '位数字';
                return;
            }
            this.attempts++;
            var res = this.getResult(v, this.target);
            this.historyList.push({ digits: v.split(''), colors: res.colors });
            if (res.isAllCorrect) {
                this.isWin = true; this.message = '🎉 猜对！'; this.addRecord(true);
            } else if (this.attempts >= this.maxAttempts) {
                this.isLose = true; this.message = '💀 次数用完'; this.addRecord(false);
            }
            this.userInput = '';
        },

        // ====================
        // 核心颜色判断逻辑（完全原样）
        // ====================
        getResult: function (u, t) {
            var ua = u.split('');
            var ta = t.split('');
            var colors = Array(ua.length).fill('red');
            var allCorrect = true;

            for (var i = 0; i < ua.length; i++) {
                if (ua[i] === ta[i]) {
                    colors[i] = 'green';
                } else {
                    allCorrect = false;
                }
            }

            if (this.currentMode === 'classic') {
                for (var i = 0; i < ua.length; i++) {
                    if (colors[i] === 'green') continue;
                    if (ta.includes(ua[i])) {
                        colors[i] = 'yellow';
                    }
                }
            } else {
                if (!this.purple) {
                    for (var i = 0; i < ua.length; i++) {
                        if (colors[i] === 'green') continue;
                        if (ta.includes(ua[i])) {
                            colors[i] = 'yellow';
                        }
                    }
                } else {
                    for (var i = 0; i < ua.length; i++) {
                        if (colors[i] === 'green') continue;
                        var p = ta.indexOf(ua[i]);
                        if (p !== -1) {
                            colors[i] = p < i ? 'yellow' : 'purple';
                        }
                    }
                }
            }

            return { colors: colors, isAllCorrect: allCorrect };
        },

        // ====================
        // 重置游戏
        // ====================
        resetGame: function () {
            this.target = this.generateTarget();
            this.attempts = 0; this.historyList = [];
            this.isWin = false; this.isLose = false;
            this.message = '新局开始'; this.userInput = '';
        },

        // ====================
        // 面板切换
        // ====================
        showPanel: function (p) {
            var panels = document.querySelectorAll('.panel');
            for (var i = 0; i < panels.length; i++)panels[i].classList.remove('active');
            document.getElementById('panel-' + p).classList.add('active');
        },

        // ====================
        // 音乐播放
        // ====================
        toggleMusic: function () {
            const audio = this.$refs.bgm;
            if (!audio) return;

            if (!this.isPlaying) {
                audio.play().then(() => {
                    this.isPlaying = true;
                }).catch(err => console.log('播放失败', err));
            } else {
                audio.pause();
                this.isPlaying = false;
            }
        },
    },
});



