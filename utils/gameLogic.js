export function strNumToBool(str) {
    return str === '1';
}

export function getTarget(len, isRepeat) {
    let result = '';
    const digits = [...'0123456789'];

    for (let i = 0; i < len; i++) {
        const idx = Math.floor(Math.random() * digits.length);  //生成0到9的随机数idx
        result += digits[idx];
        if (!isRepeat) {
            digits.splice(idx, 1);   //删掉当前的数字，使得数字不重复
        }
    }

    return result;  //返回一个随机数答案
}

export function getResult(userInput, target, isPurple, isDynamic) {
    const u = userInput.split('');
    const t = target.split('');
    const len = userInput.length;
    const result = new Array(len).fill('');
    const count = {};

    if (isDynamic) {
        t.forEach(num => {
            count[num] = (count[num] || 0) + 1;
        });
    }

    for (let i = 0; i < len; i++) {
        if (u[i] === t[i]) {
            result[i] = 'green';
            if (isDynamic) {
                count[u[i]]--;
            }
        }
    }

    if (isPurple) {
        fillPurple(u, t, result, count, isDynamic);
    } else {
        fillClassic(u, t, result, count, isDynamic);
    }

    return result;
}

export function fillClassic(u, t, result, count, isDynamic) {
    const len = u.length;

    for (let i = 0; i < len; i++) {
        if (result[i] !== '') { continue; }

        if (!isDynamic) {
            result[i] = t.includes(u[i]) ? 'yellow' : 'red';
        } else {
            if (count[u[i]] > 0) {
                result[i] = 'yellow';
                count[u[i]]--;
            } else {
                result[i] = 'red';
            }
        }
    }

}

export function fillPurple(u, t, result, count, isDynamic) {
    const len = u.length;

    for (let i = 0; i < len; i++) {
        if (result[i] !== '') { continue; }

        const pos = t.indexOf(u[i]);
        if (!isDynamic) {
            if (pos !== -1) {
                result[i] = (pos < i) ? 'yellow' : 'purple';
            } else {
                result[i] = 'red';
            }

        } else {
            if (count[u[i]] > 0) {
                result[i] = (pos < i) ? 'yellow' : 'purple';
                count[u[i]]--;
            } else {
                result[i] = 'red';
            }
        }
    }
}
