import chalk from 'chalk';
import keypress from 'keypress';
import { Monster } from './monster.js';
import { GameManager } from './gameManager.js';
import { Tools } from './tools.js';

keypress(process.stdin);


async function selectOption(logs, player, monster, options) {
    let index = 0;

    let printValues = {
        _logs: logs,
        _player: player,
        _monster: monster
    }


    //기존 로그 출력
    displayScreen(logs, player, monster);

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
                if (key.name === "up" || key.name === "w") {
                    selectedIndex = (selectedIndex - 1 + options.length) % options.length;
                    displayScreen(values._logs, values._player, values._monster);
                    renderOptions(options, selectedIndex);
                } else if (key.name === "down" || key.name === "s") {
                    selectedIndex = (selectedIndex + 1) % options.length;
                    displayScreen(values._logs, values._player, values._monster);
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

function displayScreen(logs, player, monster) {
    console.clear();
    displayStatus(player, monster);
    logs.forEach((log) => console.log(log));
}



// #region 정보 보여주기
function displayStatus(player, monster) {
    console.log(chalk.magentaBright(`\n=== Current Status ===`));
    console.log(chalk.cyanBright(`| Stage: ${GameManager.currentStage} |\n`));
    console.log(chalk.blueBright(
        `
| 플레이어 정보
----------------
| HP     : ${player.hp}
| Attack : ${player.attackAmount()}
| Item   : 공격력 아이템 ${player.inventory['attack']} 개, 체력 아이템 ${player.inventory['hp']} 개, 연막탄 ${player.inventory['smoke']} 개, 회복약 ${player.inventory['heal']} 개 
\n`
    ));
    console.log(chalk.redBright(`
| 몬스터 정보
----------------
| HP     : ${monster.hp}
| Attack : ${monster.attackAmount()}
\n`

    ));

    console.log(chalk.magentaBright(`=====================\n`));
}

// #endregion

const battle = async (player, monster) => {

    let logs = [];

    // 이겼나
    let hasWon = false;
    let hasRun = false;

    while (!GameManager.isGameOver) {

        displayScreen(logs, player, monster);

        // 탈출 체크
        if (player.isDead) {
            GameManager.isGameOver = true;
            await gameOver();
            break;
        }

        if (monster.isDead) {
            hasWon = true;
            await winBattle(player);
            break;
        }

        if (hasRun) {
            await runAway();
            break;
        }
        // end 탈출 체크

        let actions = ['1. 공격한다.', '2. 회복약 사용', '3. 도망간다.', '4. 연막탄을 사용해서 도망간다!'];

        const choice = await selectOption(logs, player, monster, actions);

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

const winBattle = async (player) => {
    console.log(chalk.green(`이겼습니다!`));

    const res = Tools.getItem(true);

    player.inventory[res] += 1;

    console.log(`엔터를 눌러주세요.`);
    await Tools.confirmInput();
}

const runAway = async () => {
    console.log(chalk.blue(`도망쳤습니다!`));

    console.log(`엔터를 눌러주세요.`);
    await Tools.confirmInput();
}

// #endregion 분기 처리


async function handleUserInput(logs, choice, player, monster) {
    let flag = false;

    // 몬스터 공격
    const monsterAttack = (logs, player, monster) => {
        //defense
        let monsterDamage = monster.damage;
        player.takeDamage(monsterDamage);
        logs.push(chalk.red(`${monsterDamage}만큼 공격 당했습니다!`));

        logs.push('\n');
    }

    switch (choice) {
        case 0:    // attack
            let playerDamage = player.damage;
            monster.takeDamage(playerDamage);

            logs.push(chalk.blue(`${playerDamage}만큼 공격했습니다!`));

            monsterAttack(logs, player, monster);

            break;

        case 1:   // heal
            if (player.inventory['heal'] === 0) {
                logs.push(chalk.magentaBright(`회복약이 없습니다!`));
            } else {
                logs.push(chalk.blue(`회복약을 사용했습니다.`));

                player.useHealItem();

                player.inventory['heal'] -= 1;

                logs.push(chalk.blue(`체력이 ${player.hp}가 되었습니다!`));
            }
            monsterAttack(logs, player, monster);
            break;
        case 2:   // run away
            if (Tools.getRandomNum(0, 1) === 0) {
                flag = true;
            } else {
                logs.push(chalk.magentaBright(`히히 못 가!`));

                monsterAttack(logs, player, monster);
            }
            break;
        case 3:   // smoke
            if (player.inventory['smoke'] > 0) {

                logs.push(chalk.blue(`연막탄을 사용했습니다!`));

                player.inventory['smoke'] -= 1;

                flag = true;
            } else {
                logs.push(chalk.magentaBright(`연막탄이 없습니다!`));

                monsterAttack(logs, player, monster);
            }

            break;

    }

    return flag;
}



// 게임 시작
export async function battleLoop(num, player) {
    console.clear();

    const stage = GameManager.currentStage;

    let hasWon = true;
    for (let i = 0; i < num; i++) {
        const monster = new Monster(stage);
        let hasWon = await battle(player, monster);

        //GameOver
        if (GameManager.isGameOver) {
            GameManager.isGameOver = true;
            player.isDead = false;
            return;
        }

        if (!hasWon) break;
    }

    return hasWon;

}