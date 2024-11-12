import keypress from 'keypress';
import { Player } from './player.js';
import { generateMap, printBoard } from './map.js';

keypress(process.stdin);

// 이동하기
function move(board, arr, dx, dy, player) {
    arr[player.x][player.y] = '·';

    player.x += dx;
    player.y += dy;

    arr[player.x][player.y] = '●';

    drawMap(board, arr, player.x, player.y);

    printBoard(arr);
}

// 타일 탐색
function checkTile(arr, x, y) {

    if (arr[x][y] === '%') {
        return false;
    }
    else if (arr[x][y] === '·') {
        return true;
    }
    else {
        return false;
    }
}

//맵 그리기
function drawMap(board, arr, x, y) {
    for (let i = x - 1; i <= x + 1; i++) {
        for (let j = y - 1; j <= y + 1; j++) {
            if (arr[i][j] === ' ') {
                arr[i][j] = board[i][j];
            }
        }
    }
}

// 이동 입력하기
function userMoveInput(board, arr, player) {

    return new Promise((resolve) => {
        function handleMoveInput(ch, key) {
            //console.log(key.name);
            if (key) {
                if (key.name === "up" || key.name === "w") { //위로 가기
                    if (checkTile(board, player.x - 1, player.y + 0))
                        move(board, arr, -1, 0, player);
                    resolve(true);
                } else if (key.name === "down" || key.name === "s") { //아래로 가기
                    if (checkTile(board, player.x + 1, player.y + 0))
                        move(board, arr, 1, 0, player);
                    resolve(true);
                } else if (key.name === "left" || key.name === "a") { //왼쪽으로 가기
                    if (checkTile(board, player.x + 0, player.y - 1))
                        move(board, arr, 0, -1, player);
                    resolve(true);
                } else if (key.name === "right" || key.name === "d") { //오른쪽으로 가기
                    if (checkTile(board, player.x + 0, player.y + 1))
                        move(board, arr, 0, 1, player);
                    resolve(true);
                } else if (key.ctrl && key.name === "c") {
                    process.exit();
                }
            }
        }

        // 입력 설정
        process.stdin.on("keypress", handleMoveInput);
        process.stdin.setRawMode(true);
        process.stdin.resume();
    })

}

// 게임 시작
export async function startGame() {
    const player = new Player();

    // 맵 생성
    const board = generateMap(player.loc);

    // 시야 맵
    let map = Array.from(new Array(board.length), () => new Array(board[0].length).fill(' '));


    //처음 맵 그리기
    drawMap(board, map, player.loc.x, player.loc.y);
    map[player.loc.x][player.loc.y] = '●';

    printBoard(map);

    await userMoveInput(board, map, player.loc);
}