class Point {
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
        this._parent;

        //room and road
        this._room;
        this._road;
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
        else
        {
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

//room 최소 크기
const MIN_ROOM_W = 10;
const MIN_ROOM_H = 6;

//분할 비율
const MIN_WIDTH = 4;
const MAX_WIDTH = 6;


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

    console.log(room._x, room._y, room._w, room._h);

    return room;
}

//나누기
function divide(parent) {

    let width = parent._w;
    let height = parent._h;

    let x = parent._x;
    let y = parent._y;
    let w = parent._w;
    let h = parent._h;

    if ((w - 4 <= MIN_ROOM_W) && (h - 4 <= MIN_ROOM_H)) {

        console.log('div' , w, h);
        //방 생성
        makeRoom(parent);
        return;
    }

    // 분할 비율 정하기
    let divRatio = Math.floor(Math.random() * (MAX_WIDTH - MIN_WIDTH + 1)) + MIN_WIDTH;

    if (width > height) {   // 가로 길이가 더 클 경우 가로 분할(좌 우)

        let slicedW = Math.floor(w * divRatio / 10);

        // lchild
        let lChild = new Container(x, y, slicedW, h);

        // rChild
        let rChild = new Container(x, y + slicedW, w - slicedW, h);

        parent._lChild = lChild;
        parent._rChild = rChild;

        divide(lChild);
        divide(rChild);

    } else {    // 세로 분할(위 아래)
        let slicedH = Math.floor( h * divRatio / 10);

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

function connect(root, arr) {

    arr[root._x][root._y] = 5;

    if (root._lChild === null || root._rChild === null) return;

    let lCenter = root._lChild.getCenter();
    let rCenter = root._rChild.getCenter();

    // 센터끼리 연결
    let road = new Road(new Point(lCenter.x,lCenter.y), new Point(rCenter.x, rCenter.y));
    root._road = road;

    // x 좌표 가 같으면 y를 다르게 하기
    if (lCenter.x === rCenter.x)
    {
        for (let i = lCenter.y ; i < rCenter.y; i++)
        {
            arr[lCenter.x][i] = 2;
        }
    }
    else if (lCenter.y === rCenter.y)
    {
        for (let i = lCenter.x; i < rCenter.x; i++)
        {
            arr[i][lCenter.y] = 2;
        }
    }
    
    //다음 컨테이너 연결
    connect(root._lChild, arr);
    connect(root._rChild, arr);
}

//BSP 알고리즘
function BSP() {

    console.clear();

    let arr = Array.from(new Array(MAP_HEIGHT), () => new Array(MAP_WIDTH).fill(' '));

    const root = new Container(0, 0, MAP_WIDTH, MAP_HEIGHT);

    //범위 나누고 길 만들기
    divide(root);
    connect(root, arr);

    //방 정보 받기
    let rooms = [];
    root.getRoom(rooms);
    
    for(let room of rooms)
    {
        const x = room._x;
        const y = room._y;
        const w = room._w;
        const h = room._h;

        for (let i = x; i < x + h; i++)
            {
                for (let j = y; j < y + w; j++)
                {
                    arr[i][j] = 1;
                }
            }

    }

    for (let row of arr) {
        let text = '';
        for (let item of row) {
            text += item;
        }

        console.log(text);

    }
}

BSP();