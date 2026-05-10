const KEY = 'RecentGames';

export function loadRecord() {
    const raw = localStorage.getItem(KEY);

    if (!raw) {
        return [];
    }else{
        return JSON.parse(raw).map(record=>({
            ...record,
            locked:record.locked??false,
        }))
    }

}

export function saveRecord(records){
    localStorage.setItem(KEY,JSON.stringify(records));
}