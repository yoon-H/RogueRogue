import keypress from 'keypress';
import { Player } from './player.js';
import { generateMap, printBoard } from './map.js';
import { Point } from './map.js';
import { Tools } from './tools.js';
import chalk from 'chalk';
import { battleLoop } from './battle.js';

keypress(process.stdin);

// 이동하기
function move(board, arr, dx, dy, player) {
    arr[player.x][player.y] = '·';

    player.x += dx;
    player.y += dy;

    arr[player.x][player.y] = '●';

    const res = drawMap(board, arr, player.x, player.y);

    printBoard(arr);

    return res;
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

    //주변에 몬스터 있는지 체크
    let isMonster = [];

    for (let i = x - 1; i <= x + 1; i++) {
        for (let j = y - 1; j <= y + 1; j++) {
            if (arr[i][j] === ' ') {
                arr[i][j] = board[i][j];

                if (board[i][j] === '▲')
                    isMonster.push(new Point(i,j));
            }
        }
    }

    return isMonster;
}

// 이동 입력하기
function userMoveInput(stage, board, arr, player) {

    let loc = player.loc;

    return new Promise((resolve) => {
        async function handleMoveInput(ch, key) {
            //console.log(key.name);
            if (key) {
                if (key.name === "up" || key.name === "w") { //위로 가기
                    if (checkTile(board, loc.x - 1, loc.y + 0)) {
                        const res = await move(board, arr, -1, 0, loc);
                        console.log(res);
                        if(res.length > 0 ) {// TODO : Move to battle
                            
                            // 이벤트 삭제
                            deleteInput();

                            //battle 로그
                            meetMonster(stage, board , arr, res, player);
                        
                        }
                    }
                    resolve(true);
                } else if (key.name === "down" || key.name === "s") { //아래로 가기
                    if (checkTile(board, loc.x + 1, loc.y + 0)) {
                        const res = await move(board, arr, 1, 0, loc);
                        console.log(res);
                        if(res.length > 0 ) {// TODO : Move to battle
                            
                            // 이벤트 삭제
                            deleteInput();

                            //battle 로그
                            meetMonster(stage, board, arr, res, player);
                        
                        }
                    }
                    resolve(true);
                } else if (key.name === "left" || key.name === "a") { //왼쪽으로 가기
                    if (checkTile(board, loc.x + 0, loc.y - 1)) {
                        const res = await move(board, arr, 0, -1, loc);
                        console.log(res);
                        if(res.length > 0 ) {// TODO : Move to battle
                            
                            // 이벤트 삭제
                            deleteInput();

                            //battle 로그
                            meetMonster(stage, board, arr, res, player);
                        
                        }
                    }

                    resolve(true);
                } else if (key.name === "right" || key.name === "d") { //오른쪽으로 가기
                    if (checkTile(board, loc.x + 0, loc.y + 1)) {
                        const res = await move(board, arr, 0, 1, loc);
                        console.log(res);
                        if(res.length > 0 ) {// TODO : Move to battle
                            
                            // 이벤트 삭제
                            deleteInput();

                            //battle 로그
                            meetMonster(stage, board, arr, res, player);
                        
                        }
                    }
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

        //입력 설정(입력 이벤트 제거)
        const deleteInput = () => {
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.stdin.removeListener("keypress", handleMoveInput); // 이벤트 리스너 제거
        }
    })

}

// #region 분기 처리
const meetMonster = async (stage, board, map, monsters, player) => {
    console.log(chalk.red(`몬스터를 발견했어요!`));

    console.log(chalk.gray(`엔터를 눌러주세요.`));
    await Tools.confirmInput();

    const res = await battleLoop(stage, monsters.length, player);

    if(res) {
        for(const item of monsters)
        {
            map[item.x][item.y] = '·';
            board[item.x][item.y] = '·';
        }
    }

    game(stage, player, board, map);
}
// #endregion 


// gameLoop
async function game(stage, player, board, map) {

    printBoard(map);

    await userMoveInput(stage, board, map, player);
}



// 게임 시작
export async function startGame() {
    const player = new Player();
    
    //현재 스테이지
    let stage = 1;

    // 맵 생성
    const board = generateMap(player.loc);

    // 시야 맵
    let map = Array.from(new Array(board.length), () => new Array(board[0].length).fill(' '));

    //처음 맵 그리기
    drawMap(board, map, player.loc.x, player.loc.y);
    map[player.loc.x][player.loc.y] = '●';

    game(stage, player, board, map);
}