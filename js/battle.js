import chalk from 'chalk';
//import readlineSync from 'readline-sync';
import keypress from 'keypress';
import { Monster } from './monster.js';
import { GameManager } from './gameManager.js';
import { start } from "./server.js";
import { Tools } from './tools.js';

keypress(process.stdin);


async function selectOption(logs, stage, player, monster, options) {
    let index = 0;

    let printValues = {
        _logs: logs,
        _stage: stage,
        _player: player,
        _monster: monster
    }


    //기존 로그 출력
    displayScreen(logs, stage, player, monster);

    //옵션 출력
    renderOptions(options, index);

    //선택하기
    index = await select(printValues, options, index);  // resolve를 파라미터로 전달

    return index;

}

// 선택하기
function select(values, options, selectedIndex) {
    return new Promise((resolve) => {
        function handleOptionInput(ch, key) {
            if (key) {
                if (key.name === "up" || ch === '1') {
                    selectedIndex = (selectedIndex - 1 + options.length) % options.length;
                    displayScreen(values._logs, values._stage, values._player, values._monster);
                    renderOptions(options, selectedIndex);
                } else if (key.name === "down" || ch === '2') {
                    selectedIndex = (selectedIndex + 1) % options.length;
                    displayScreen(values._logs, values._stage, values._player, values._monster);
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

//옵션 보여주기
function renderOptions(options, selectedIndex) {
    console.log("\n당신의 선택은?");

    options.forEach((option, index) => {
        if (index === selectedIndex) {
            console.log(`> ${option}`); // 현재 선택된 항목에 화살표 표시
        } else {
            console.log(`  ${option}`);
        }
    });

}



function displayScreen(logs, stage, player, monster) {
    console.clear();
    displayStatus(stage, player, monster);
    logs.forEach((log) => console.log(log));
}



// #region 정보 보여주기
function displayStatus(stage, player, monster) {
    console.log(chalk.magentaBright(`\n=== Current Status ===`));
    console.log(chalk.cyanBright(`| Stage: ${stage} |\n`));
    console.log(chalk.blueBright(
        `
| 플레이어 정보
----------------
| LEVEL  : ${player.level} 
| HP     : ${player.hp}
| Attack : ${player.attackAmount()}
\n`
    ))

    console.log(chalk.redBright(`
| 몬스터 정보
----------------
| LEVEL  : ${monster.level} 
| HP     : ${monster.hp}
| Attack : ${monster.attackAmount()}
\n`

    ))

    console.log(chalk.magentaBright(`=====================\n`));
}

// #endregion

const battle = async (stage, player, monster) => {

    let logs = [];

    // 이겼나
    let hasWon = false;
    let hasRun = false;

    while (!GameManager.isGameOver) {
        //console.clear();

        displayScreen(logs, stage, player, monster);

        console.log('screen');

        // 탈출 체크
        if (player.isDead) {
            GameManager.isGameOver = true;
            await gameOver();
            break;
        }

        if (monster.isDead) {
            hasWon = true;
            await stageClear();
            break;
        }

        if (hasRun) {
            await runAway();
            break;
        }
        // end 탈출 체크

        let actions = ['1. 공격한다.', '2. 도망간다.'];

        const choice = await selectOption(logs, stage, player, monster, actions);

        console.log("in battle choice : " + choice);

        logs = [];

        // 플레이어의 선택에 따라 다음 행동 처리
        logs.push(chalk.green(`${actions[choice]} 를 선택하셨습니다.`));

        hasRun = await handleUserInput(logs, choice, player, monster);

    }

    return hasWon;

};

// #region 분기 처리
const gameOver = async () => {
    console.log(chalk.red(`GAME OVER!`));

    console.log(`엔터를 눌러주세요.`);
    await Tools.confirmInput();
}

const stageClear = async () => {
    console.log(chalk.green(`이겼습니다!`));

    console.log(`엔터를 눌러주세요.`);
    await Tools.confirmInput();
}

const runAway = async () => {
    console.log(chalk.blue(`도망쳤습니다!`));

    console.log(`엔터를 눌러주세요.`);
    await Tools.confirmInput();
}

// #endregion 분기 처리



// #region end로 넘기기
// function confirm() {
//     return new Promise((resolve) => {
//         function handleConfirmInput(ch, key) {
//             if (key) {
//                 if (key.name === "return") {

//                     //입력 설정(입력 이벤트 제거)
//                     process.stdin.setRawMode(false);
//                     process.stdin.pause();
//                     process.stdin.removeListener("keypress", handleConfirmInput); // 이벤트 리스너 제거
//                     resolve(true); // 선택 완료 후 resolve 호출
//                 } else if (key.ctrl && key.name === "c") {
//                     process.exit();
//                 }
//             }
//         }

//         // 입력 설정
//         process.stdin.on("keypress", handleConfirmInput);
//         process.stdin.setRawMode(true);
//         process.stdin.resume();

//     })

// }
// #endregion


async function handleUserInput(logs, choice, player, monster) {
    let flag = false;
    switch (choice) {
        case 0:    // attack
            let playerDamage = player.damage;
            monster.takeDamage(playerDamage);

            logs.push(chalk.blue(`${playerDamage}만큼 공격했습니다!`));

            //defense
            let monsterDamage = monster.damage;
            player.takeDamage(monsterDamage);

            logs.push(chalk.red(`${monster.damage}만큼 공격 당했습니다!`));

            logs.push('\n');
            break;

        case 1:   // run away
            flag = true;
            break;

    }

    return flag;
}



// 게임 시작
export async function battleLoop(stage, num, player) {
    console.clear();

    console.log('loop');
    console.log('num ', num);
    let hasWon = true;
    for (let i = 0; i < num; i++) {
        const monster = new Monster(stage);
        let hasWon = await battle(stage, player, monster);

        //GameOver
        if (GameManager.isGameOver) {
            GameManager.isGameOver = false;
            player.isDead = false;
            start();
        }

        // 플레이어 체력 회복
        player.reset();

        //TODO :: map으로 넘기기
        if(!hasWon) break;
    }

    return hasWon;

}