/**
 * ================================================================
 *  🎯  猜数字游戏 —— 核心逻辑模块
 *  包含目标生成、输入校验、结果判定等核心算法。
 *  支持经典模式和紫色数字模式，以及动态提示功能。
 * ================================================================
 */

/**
 * 将字符串转换为布尔值
 * 用于将配置中的 '0'/'1' 字符串转换为布尔值。
 *
 * @param {string} str - 待转换的字符串（'0' 或 '1'）
 * @returns {boolean} - '1' 返回 true，其他返回 false
 *
 * @example
 * strNumToBool('1'); // true
 * strNumToBool('0'); // false
 */
export function strNumToBool(str) {
    return str === '1';
}

/**
 * 生成目标数字串
 * 根据指定位数和是否允许重复，随机生成目标数字。
 *
 * @param {number}  len      - 目标数字的位数
 * @param {boolean} isRepeat - 是否允许数字重复
 * @returns {string} - 生成的目标数字串
 *
 * @example
 * // 生成 4 位不重复数字
 * const target = getTarget(4, false); // 如 '3572'
 *
 * // 生成 4 位可重复数字
 * const target2 = getTarget(4, true); // 如 '3317'
 */
export function getTarget(len, isRepeat) {
    let result = '';
    const digits = [...'0123456789'];

    for (let i = 0; i < len; i++) {
        const idx = Math.floor(Math.random() * digits.length);  // 生成0到digits.length-1的随机数idx
        result += digits[idx];
        if (!isRepeat) {
            digits.splice(idx, 1);   // 删除当前数字，使数字不重复
        }
    }

    return result;
}

/**
 * 判断用户输入与目标数字的匹配结果（核心算法）
 * 根据输入、目标、是否启用紫色数字、是否启用动态提示，返回颜色数组。
 *
 * 颜色含义：
 * - 'green'  ：数字和位置都正确
 * - 'yellow' ：数字正确但位置错误（经典模式）/ 位置错误且在目标中存在（动态模式）
 * - 'purple' ：数字正确且位置在目标中位于当前位置之后（紫色模式）
 * - 'red'    ：数字不在目标中（或动态模式下次数已耗尽）
 *
 * @param {string}  userInput - 用户输入的数字串
 * @param {string}  target    - 目标数字串
 * @param {boolean} isPurple  - 是否启用紫色数字模式
 * @param {boolean} isDynamic - 是否启用动态提示模式（考虑目标中数字出现次数）
 * @returns {string[]} - 颜色数组，长度与 userInput 相同
 *
 * @example
 * // 经典模式，不启用动态提示
 * getResult('1234', '1536', false, false);
 * // 返回 ['green', 'red', 'yellow', 'red']
 *
 * // 紫色模式，启用动态提示
 * getResult('1123', '1234', true, true);
 * // 返回 ['purple', 'green', 'yellow', 'red']
 */
export function getResult(userInput, target, isPurple, isDynamic) {
    const u = userInput.split('');
    const t = target.split('');
    const len = userInput.length;
    const result = new Array(len).fill('');
    const count = {};

    // 动态提示：统计目标中每个数字的出现次数
    if (isDynamic) {
        t.forEach(num => {
            count[num] = (count[num] || 0) + 1;
        });
    }

    // 第一轮：标记完全匹配（绿色）
    for (let i = 0; i < len; i++) {
        if (u[i] === t[i]) {
            result[i] = 'green';
            if (isDynamic) {
                count[u[i]]--;
            }
        }
    }

    // 第二轮：根据模式填充剩余颜色
    if (isPurple) {
        fillPurple(u, t, result, count, isDynamic);
    } else {
        fillClassic(u, t, result, count, isDynamic);
    }

    return result;
}

/**
 * 经典模式颜色填充
 * 用于非紫色模式下的颜色判断。
 * 规则：
 * - 数字在目标中且位置正确 → 已由外部标记为 green
 * - 数字在目标中但位置不同 → yellow
 * - 数字不在目标中（或动态模式下次数耗尽）→ red
 *
 * @param {string[]}      u          - 用户输入数字数组
 * @param {string[]}      t          - 目标数字数组
 * @param {string[]}      result     - 颜色结果数组（green 已标记）
 * @param {Object}        count      - 目标数字出现次数的统计对象（动态模式使用）
 * @param {boolean}       isDynamic  - 是否启用动态提示模式
 * @private
 */
export function fillClassic(u, t, result, count, isDynamic) {
    const len = u.length;

    for (let i = 0; i < len; i++) {
        if (result[i] !== '') { continue; }  // 跳过已标记为 green 的

        if (!isDynamic) {
            // 非动态模式：只判断数字是否在目标中
            result[i] = t.includes(u[i]) ? 'yellow' : 'red';
        } else {
            // 动态模式：判断数字是否还有剩余次数
            if (count[u[i]] > 0) {
                result[i] = 'yellow';
                count[u[i]]--;
            } else {
                result[i] = 'red';
            }
        }
    }
}

/**
 * 紫色模式颜色填充
 * 用于紫色数字模式下的颜色判断。
 * 规则：
 * - 数字在目标中且位置正确 → 已由外部标记为 green
 * - 数字在目标中，且其位置在当前位置之后 → purple
 * - 数字在目标中，但其位置在当前位置之前 → yellow
 * - 数字不在目标中（或动态模式下次数耗尽）→ red
 *
 * @param {string[]}      u          - 用户输入数字数组
 * @param {string[]}      t          - 目标数字数组
 * @param {string[]}      result     - 颜色结果数组（green 已标记）
 * @param {Object}        count      - 目标数字出现次数的统计对象（动态模式使用）
 * @param {boolean}       isDynamic  - 是否启用动态提示模式
 * @private
 */
export function fillPurple(u, t, result, count, isDynamic) {
    const len = u.length;

    for (let i = 0; i < len; i++) {
        if (result[i] !== '') { continue; }  // 跳过已标记为 green 的

        const pos = t.indexOf(u[i]);
        if (!isDynamic) {
            // 非动态模式：判断数字是否在目标中及其位置关系
            if (pos !== -1) {
                // pos < i 表示该数字在目标中的位置比当前输入位置靠前 → yellow
                // pos > i 表示该数字在目标中的位置比当前输入位置靠后 → purple
                result[i] = (pos < i) ? 'yellow' : 'purple';
            } else {
                result[i] = 'red';
            }
        } else {
            // 动态模式：先判断数字是否还有剩余次数
            if (count[u[i]] > 0) {
                result[i] = (pos < i) ? 'yellow' : 'purple';
                count[u[i]]--;
            } else {
                result[i] = 'red';
            }
        }
    }
}