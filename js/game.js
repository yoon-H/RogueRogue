import keypress from 'keypress';
import { Player } from './player.js';
import { generateMap, printBoard } from './map.js';
import { Point } from './map.js';
import { Tools } from './tools.js';
import chalk from 'chalk';
import { battleLoop } from './battle.js';
import { GameManager } from './gameManager.js';
import { start } from './server.js';

keypress(process.stdin);

// 이동하기
function move(board, arr, dx, dy, player) {
    arr[player.x][player.y] = '·';

    player.x += dx;
    player.y += dy;

    arr[player.x][player.y] = '●';

    const res = drawMap(board, arr, player.x, player.y);

    return res;
}

// 타일 탐색
function checkTile(arr, x, y) { // 'wall', 'space' , 'stairs' ,  'none'

    if (arr[x][y] === '%') {
        return 'wall';
    }
    else if (arr[x][y] === '·') {
        return 'space';
    }
    else if (arr[x][y] === '■') {
        return 'stairs';
    }
    else {
        return 'none';
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
                    isMonster.push(new Point(i, j));
            }
        }
    }

    return isMonster;
}

// 이동 입력하기
function userMoveInput(board, arr, player) {

    let loc = player.loc;

    return new Promise((resolve) => {
        async function handleMoveInput(ch, key) {
            if (key) {
                if (key.name === "up" || key.name === "w") { //위로 가기
                    //분기 처리
                    await inputHandler(board, arr, player, -1, 0);
                    resolve(true);
                } else if (key.name === "down" || key.name === "s") { //아래로 가기
                    //분기 처리
                    await inputHandler(board, arr, player, 1, 0);
                    resolve(true);
                } else if (key.name === "left" || key.name === "a") { //왼쪽으로 가기
                    //분기 처리
                    await inputHandler(board, arr, player, 0, -1);
                    resolve(true);
                } else if (key.name === "right" || key.name === "d") { //오른쪽으로 가기
                    //분기 처리
                    await inputHandler(board, arr, player, 0, 1);
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

        const inputHandler = async (board, arr, player, dx, dy) => {
            // 이벤트 삭제
            deleteInput();
            switch (checkTile(board, loc.x + dx, loc.y + dy)) {
                case 'space':
                    const res = move(board, arr, dx, dy, loc);
                    console.log(res);
                    if (res.length > 0) {
                        
                        //battle 로그
                        await meetMonster(board, arr, res, player);
                    }
                    break;
                case 'stairs':

                    //다음 스테이지로 이동
                    await selectStageClear(arr);

                    break;
            }
        }
    })

}

// #region 분기 처리
const meetMonster = async (board, map, monsters, player) => {

    printBoard(map);

    console.log(chalk.red(`몬스터를 발견했어요!`));

    console.log(chalk.gray(`엔터를 눌러주세요.`));
    const confirm = await Tools.confirmInput();

    console.log(confirm);

    const res = await battleLoop(monsters.length, player);

    if (res) {
        for (const item of monsters) {
            map[item.x][item.y] = '·';
            board[item.x][item.y] = '·';
        }
    }
}


// #region 스테이지 옵션 선택하기
async function selectStage(arr) {
    let index = 0;

    const actions = ['1. 다음 스테이지로!', '2. 싫어요!'];

    //기존 로그 출력
    printBoard(arr);

    //옵션 출력
    renderOptions(actions, index);

    //선택하기
    index = await select(arr, actions, index);  // resolve를 파라미터로 전달

    return index === 0;

}

//옵션 보여주기
function renderOptions(options, selectedIndex) {
    console.log(chalk.red(`다음 스테이지로 넘어갈까요?`));

    options.forEach((option, index) => {
        if (index === selectedIndex) {
            console.log(`> ${option}`); // 현재 선택된 항목에 화살표 표시
        } else {
            console.log(`  ${option}`);
        }
    });

}

// 선택하기
function select(arr, options, selectedIndex) {
    return new Promise((resolve) => {
        function handleOptionInput(ch, key) {
            if (key) {
                if (key.name === "up" || key.name === "w") {
                    selectedIndex = (selectedIndex - 1 + options.length) % options.length;
                    printBoard(arr);
                    renderOptions(options, selectedIndex);
                } else if (key.name === "down" || key.name === "s") {
                    selectedIndex = (selectedIndex + 1) % options.length;
                    printBoard(arr);
                    renderOptions(options, selectedIndex);
                } else if (key.name === "return") {

                    //입력 설정(입력 이벤트 제거)
                    process.stdin.setRawMode(false);
                    process.stdin.pause();
                    process.stdin.removeListener("keypress", handleOptionInput); // 이벤트 리스너 제거
                    resolve(selectedIndex); // 선택 완료 후 resolve 호출
                } else if (key.ctrl && key.name === "c") {
                    process.exit();
                }
            }
        }

        // 입력 설정
        process.stdin.on("keypress", handleOptionInput);
        process.stdin.setRawMode(true);
        process.stdin.resume();

    })

}

const selectStageClear = async (map) => {

    const flag = await selectStage(map);

    if (flag) {
        GameManager.currentStage += 1;
    }

}

// #endregion

// #endregion 

// 스테이지 시작 
function newStage(player) {
    // 맵 생성
    const _board = generateMap(player.loc);

    // 시야 맵
    let _map = Array.from(new Array(_board.length), () => new Array(_board[0].length).fill(' '));

    //처음 맵 그리기
    drawMap(_board, _map, player.loc.x, player.loc.y);
    _map[player.loc.x][player.loc.y] = '●';

    return {
        board: _board,
        map: _map
    }
}

//Show Screen
function showScreen(map, player) {

    //맵 그리기
    printBoard(map);

    //상태 그리기
    displayStatus(player);
}

//Show Status
function displayStatus(player) {
    console.log(chalk.magentaBright(`\n=== Current Status ===`));
    console.log(chalk.cyanBright(`| Stage: ${GameManager.currentStage} | 플레이어 정보 | HP : ${player.hp} | `));
    console.log(chalk.magentaBright(`=====================\n`));
}



// gameLoop
async function game(stage, player) {

    while (!GameManager.isGameOver) {

        //스테이지 초기화
        stage = GameManager.currentStage;

        //새로운 스테이지 생성
        let { board, map } = newStage(player);

        while (!GameManager.isGameOver && GameManager.currentStage === stage) {

            showScreen(map, player);

            //입력 처리
            await userMoveInput(board, map, player);
        }
    }

    //게임 오버 하면
    start();
}



// 게임 시작
export async function startGame() {
    const player = new Player();

    //현재 스테이지
    let stage = 1;

    game(stage, player);
}