import keypress from 'keypress';
import { Player } from './player.js';
import {generateMap, printBoard} from './map.js';

keypress(process.stdin);

// 이동하기
function move(arr, dx, dy , player) {
    arr[player.x][player.y] = '·';

    player.x += dx;
    player.y += dy;

    arr[player.x][player.y] = '●';

    
    printBoard(arr);
}

// 타일 탐색
function checkTile(arr, x, y) {

    if(arr[x][y] === '%')
    {
        return false;
    }
    else if(arr[x][y] === '·')
    {
        return true;
    }
    else{
        return false;
    }
}

// 이동 입력하기
function userMoveInput(arr, player) {

    return new Promise ((resolve) => {
        function handleMoveInput(ch, key) {
            //console.log(key.name);
            if (key) {
                if (key.name === "up" || ch === '1') { //위로 가기
                    if(checkTile(arr, player.x -1, player.y + 0)) 
                        move(arr, -1, 0, player);  
                    resolve(true);          
                } else if (key.name === "down") { //아래로 가기
                    if(checkTile(arr, player.x + 1, player.y + 0)) 
                        move(arr, 1, 0, player);     
                    resolve(true); 
                } else if (key.name === "left") { //왼쪽으로 가기
                    if(checkTile(arr, player.x + 0, player.y -1)) 
                        move(arr, 0, -1, player);     
                    resolve(true); 
                } else if (key.name === "right") { //오른쪽으로 가기
                    if(checkTile(arr, player.x + 0, player.y +1)) 
                        move(arr, 0, 1, player);     
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

    let board = generateMap(player.loc);

    await userMoveInput(board, player.loc);
}