import keypress from 'keypress';
import { Tools } from './tools.js'

keypress(process.stdin);

export class Point {
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }

    get x() {
        return this._x;
    }

    set x(value) {
        this._x = value;
    }

    get y() {
        return this._y;
    }

    set y(value) {
        this._y = value;
    }

}

class Room {
    constructor() {
        this._x;
        this._y;
        this._w;
        this._h;

        //오브젝트 수
        this._objCount = 0;
        this._monster = [];
        this._player = false;
        this._item = [];
    }
}

class Road {
    constructor(start, end) {
        this._x1 = start.x;
        this._y1 = start.y;
        this._x2 = end.x;
        this._y2 = end.y;
    }
}

class Container {
    constructor(x, y, w, h) {
        this._x = x;
        this._y = y;
        this._w = w;
        this._h = h;

        //Container
        this._lChild = null;
        this._rChild = null;
        this._parent = null;

        //room and road
        this._room = null;
        this._road = null;
    }

    getParent() {
        return this._parent;
    }

    getCenter() {

        const center = new Point(Math.floor(this._x + this._h / 2), Math.floor(this._y + this._w / 2));

        return center;
    }

    getRoom(rooms) {
        if (!this._lChild && !this._rChild && this._room)
            rooms.push(this._room);
        else {
            if (this._lChild)
                this._lChild.getRoom(rooms);
            if (this._rChild)
                this._rChild.getRoom(rooms);
        }
    }
}

// map 크기
const MAP_WIDTH = 40;
const MAP_HEIGHT = 20;

//room 최소, 최대 크기
const MIN_ROOM_W = 3;
const MIN_ROOM_H = 3;
const MAX_ROOM_W = 9;
const MAX_ROOM_H = 8;

//분할 비율
const MIN_WIDTH = 4;
const MAX_WIDTH = 6;

//몬스터 수
const MIN_MONSTER = 3;
const MAX_MONSTER = 6;

//방 만들기
function makeRoom(container) {

    let x = container._x;
    let y = container._y;
    let w = container._w;
    let h = container._h;

    let room = new Room();

    //컨테이너 내부로 조정하기
    room._x = x + 2;
    room._y = y + 2;
    room._w = w - 4;
    room._h = h - 4;

    //컨테이너의 방 지정하기
    container._room = room;

    return room;
}

//사이즈 체크 후 분할 결정
function checkSize(parent, width, height) {

    if ((width - 4 <= MIN_ROOM_W) || (height - 4 <= MIN_ROOM_H)) {
        return false;
    }
    else if ((width - 4 <= MAX_ROOM_W) && (height - 4 <= MAX_ROOM_H)) {
        //방 생성
        makeRoom(parent);
        return false;
    }

    return true;
}


//나누기
function divide(parent) {

    let width = parent._w;
    let height = parent._h;

    let x = parent._x;
    let y = parent._y;
    let w = parent._w;
    let h = parent._h;

    // 분할 비율 정하기
    let divRatio = Tools.getRandomNum(MIN_WIDTH, MAX_WIDTH);

    if (width > height) {   // 가로 길이가 더 클 경우 가로 분할(좌 우)

        let slicedW = Math.floor(w * divRatio / 10);

        // 사이즈 체크
        if (!checkSize(parent, width, height)) return;

        // lchild
        let lChild = new Container(x, y, slicedW, h);

        // rChild
        let rChild = new Container(x, y + slicedW, w - slicedW, h);

        parent._lChild = lChild;
        parent._rChild = rChild;

        divide(lChild);
        divide(rChild);

    } else {    // 세로 분할(위 아래)
        let slicedH = Math.floor(h * divRatio / 10);

        // 사이즈 체크
        if (!checkSize(parent, width, height)) return;

        // lchild
        let lChild = new Container(x, y, w, slicedH);

        // rChild
        let rChild = new Container(x + slicedH, y, w, h - slicedH);

        parent._lChild = lChild;
        parent._rChild = rChild;

        divide(lChild);
        divide(rChild);
    }
}

//연결하기
function connect(root, arr) {

    //마지막 컨테이너면 return
    if (root._lChild === null || root._rChild === null) return;

    let lCenter = root._lChild.getCenter()
    let rCenter = root._rChild.getCenter()

    // 센터끼리 연결
    let road = new Road(new Point(lCenter.x, lCenter.y), new Point(rCenter.x, rCenter.y));
    root._road = road;

    // x 좌표 가 같으면 y를 다르게 하기
    if (lCenter.x === rCenter.x) {
        for (let i = lCenter.y; i < rCenter.y; i++) {
            arr[lCenter.x][i] = '·';
        }
    }
    else if (lCenter.y === rCenter.y) {
        for (let i = lCenter.x; i < rCenter.x; i++) {
            arr[i][lCenter.y] = '·';
        }
    }

    //다음 컨테이너 연결
    connect(root._lChild, arr);
    connect(root._rChild, arr);
}

//room 내에서 위치 잡기
function getRoomLoc(arr, room) {

    let x = room._x;
    let y = room._y;
    let w = room._w;
    let h = room._h;

    // 방에서 랜덤 위치 받기
    let xIdx;
    let yIdx;

    do {
        xIdx =Tools.getRandomNum(x, x + h - 1);
        yIdx = Tools.getRandomNum(y, y + w - 1);
    }while (arr[xIdx][yIdx] !== '%')

    return new Point(xIdx, yIdx);
}


//오브젝트 위치 정하기
function spawnObjects(arr, rooms, player) {
    //몬스터 수 정하기
    let monsterCnt = Tools.getRandomNum(MIN_MONSTER, MAX_MONSTER);

    //플레이어가 위치할 방 인덱스 정하기
    let playerLoc = Tools.getRandomNum(0, rooms.length - 1);

    let hasClear = false;

    // 순회하면서 플레이어와 몬스터 배치
    while (monsterCnt > 0) {
        rooms.forEach((room, idx) => {
            if (idx === playerLoc)   //플레이어 위치 설정
            {
                if (!room._player)   // 한 번 입력되면 건너뛰기
                {
                    room._objCount += 1;
                    room._player = true;

                    //플레이어 랜덤 위치
                    const loc = getRoomLoc(arr, room);

                    player.x = loc.x;
                    player.y = loc.y;

                    arr[player.x][player.y] = '●';
                }

            }
            else {

                if (!hasClear) {//이동 계단 만들기
                    if(Tools.getRandomNum(0, 1) === 1) {
                        const clearLoc = getRoomLoc(arr, room);

                        arr[clearLoc.x][clearLoc.y] = '■';

                        hasClear = true;
                    }
                }

                if (monsterCnt > 0) {// 몬스터 개수가 남아 있으면
                    if (Tools.getRandomNum(0, 1) === 1) {
                        room._objCount += 1;
                        //몬스터 위치 선정
                        let monLoc = getRoomLoc(arr, room);

                        room._monster.push(monLoc);

                        arr[monLoc.x][monLoc.y] = '▲';

                        monsterCnt -= 1;
                    }
                }
            }
        });
    }

}

//BSP 알고리즘
function BSP(arr, player) {
    const root = new Container(0, 0, MAP_WIDTH, MAP_HEIGHT);

    //범위 나누고 길 만들기
    divide(root);
    connect(root, arr);

    //방 정보 받기
    let rooms = [];
    root.getRoom(rooms);

    //플레이어, 몬스터 스폰
    spawnObjects(arr, rooms, player);


    for (let room of rooms) {
        const x = room._x;
        const y = room._y;
        const w = room._w;
        const h = room._h;

        for (let i = x; i < x + h; i++) {
            for (let j = y; j < y + w; j++) {
                if (arr[i][j] === '%')
                    arr[i][j] = '·';
            }
        }
    }

    arr[player.x][player.y] = '·';

}

//화면 출력
export function printBoard(arr) {
    console.clear();

    for (let row of arr) {
        let text = '';
        for (let item of row) {
            text += item;
        }

        console.log(text);
    }
}


export function generateMap(player) {
    let arr = Array.from(new Array(MAP_HEIGHT), () => new Array(MAP_WIDTH).fill('%'));
    
    //BSP 알고리즘 실행
    BSP(arr, player);
    return arr;
}