import chalk from 'chalk';
import readlineSync from 'readline-sync';
import { Player } from './player.js';
import { Monster } from './monster.js';
import { GameManager } from './gameManager.js';
import { start } from "./server.js";

function displayStatus(stage, player, monster) {
    console.log(chalk.magentaBright(`\n=== Current Status ===`));
    console.log(chalk.cyanBright(`| Stage: ${stage} | Gameover : ${GameManager.isGameOver}\n`));
    console.log(chalk.blueBright(
        `
| 플레이어 정보
----------------
| LEVEL : ${player.level} 
| HP    : ${player.hp}\n`
    ))

    console.log(chalk.redBright(`
| 몬스터 정보
----------------
| LEVEL : ${monster.level} 
| HP    : ${monster.hp}\n`

    ))

    console.log(chalk.magentaBright(`=====================\n`));
}

const battle = async (stage, player, monster) => {

    let logs = [];

    // 이겼나
    let hasWon = false;

    while (!GameManager.isGameOver) {
        console.clear();

        displayStatus(stage, player, monster);

        logs.forEach((log) => console.log(log));

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

        console.log(
            chalk.green(
                `\n1. 공격한다 2. 아무것도 하지 않는다.`,
            ),
        );
        const choice = readlineSync.question('당신의 선택은? ');

        // 플레이어의 선택에 따라 다음 행동 처리
        logs.push(chalk.green(`${choice}를 선택하셨습니다.`));

        handleUserInput(logs, choice, player, monster)
    }

    return hasWon;

};

const gameOver = async() => {
    console.log(chalk.red(`GAME OVER!`));

    readlineSync.question('엔터를 눌러주세요.');
}

const stageClear = async() => {
    console.log(chalk.green(`이겼습니다!`));

    readlineSync.question('엔터를 눌러주세요.');
}


function handleUserInput(logs, choice, player, monster) {
    switch (choice) {
        case '1':    // attack
            let playerDamage = player.damage;
            monster.takeDamage(playerDamage);

            logs.push(chalk.blue(`${playerDamage}만큼 공격했습니다!`));

            let monsterDamage = monster.damage;
            player.takeDamage(monsterDamage);

            logs.push(chalk.red(`${monster.damage}만큼 공격 당했습니다!`));

            logs.push('\n');

            break;
        default:   // run away

    }
}



// 게임 시작
export async function startGame() {
    console.clear();
    const player = new Player();
    let stage = 1;

    while (stage <= 10) {
        const monster = new Monster(stage);
        let hasWon = await battle(stage, player, monster);

        //GameOver
        if (GameManager.isGameOver) {
            GameManager.isGameOver = false;
            player.isDead = false;
            start();
            break;
        }

        // 플레이어 체력 회복
        player.reset();

        // 스테이지 클리어 및 게임 종료 조건

        if (hasWon) {
            stage++;
        }
    }
}