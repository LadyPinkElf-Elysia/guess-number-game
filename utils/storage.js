/**
 * ================================================================
 *  💾  游戏记录存储模块
 *  负责游戏历史记录的本地持久化（基于 localStorage）。
 *  提供战绩的读取、写入功能，并处理数据格式的兼容性。
 * ================================================================
 */

/** localStorage 存储键名 */
const KEY = 'RecentGames';

/**
 * 从 localStorage 加载游戏历史记录
 * 若数据不存在或解析失败，返回空数组。
 * 每条记录会自动补全 `locked` 字段（默认 false），确保旧数据兼容。
 *
 * @returns {Array<Object>} 历史记录数组
 * @property {string}   gameName  - 游戏名称
 * @property {number}   attempt   - 尝试次数
 * @property {number}   max       - 最大尝试次数
 * @property {number}   score     - 最终得分
 * @property {boolean}  win       - 是否胜利
 * @property {Array}    list      - 猜测记录列表
 * @property {Array}    hint      - 提示记录列表
 * @property {boolean}  locked    - 是否锁定（锁定后不会被自动清除）
 *
 * @example
 * // 加载战绩
 * const records = loadRecord();
 * console.log(records); // [{ gameName: '经典-简单', attempt: 3, win: true, ... }]
 */
export function loadRecord() {
    const raw = localStorage.getItem(KEY);

    if (!raw) {
        return [];
    } else {
        return JSON.parse(raw).map(record => ({
            ...record,
            // 兼容旧数据：若 locked 字段不存在，默认为 false
            locked: record.locked ?? false,
        }));
    }
}

/**
 * 保存游戏历史记录到 localStorage
 *
 * @param {Array<Object>} records - 历史记录数组
 * @param {string}   records[].gameName  - 游戏名称
 * @param {number}   records[].attempt   - 尝试次数
 * @param {number}   records[].max       - 最大尝试次数
 * @param {number}   records[].score     - 最终得分
 * @param {boolean}  records[].win       - 是否胜利
 * @param {Array}    records[].list      - 猜测记录列表
 * @param {Array}    records[].hint      - 提示记录列表
 * @param {boolean}  records[].locked    - 是否锁定
 * @returns {void}
 *
 * @example
 * // 保存战绩
 * const records = [
 *   { gameName: '经典-简单', attempt: 3, max: 10, score: 85, win: true, list: [], hint: [], locked: false }
 * ];
 * saveRecord(records);
 */
export function saveRecord(records) {
    localStorage.setItem(KEY, JSON.stringify(records));
}