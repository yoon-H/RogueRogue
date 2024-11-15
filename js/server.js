import chalk from 'chalk';
import figlet from 'figlet';
import { startGame } from "./game.js";
import keypress from 'keypress';
import { GameManager } from './gameManager.js';

keypress(process.stdin);

// 로비 화면을 출력하는 함수
function displayLobby(logs, options, selectedIndex) {
    console.clear();

    // 타이틀 텍스트
    console.log(
        chalk.cyan(
            figlet.textSync('RogueRogue', {
                font: 'Standard',
                horizontalLayout: 'default',
                verticalLayout: 'default'
            })
        )
    );

    // 상단 경계선
    const line = chalk.magentaBright('='.repeat(50));
    console.log(line);

    // 설명 텍스트
    console.log(chalk.green('옵션을 선택해주세요.'));
    console.log();

    options.forEach((option, index) => {
        if (index === selectedIndex) {
            console.log(chalk.blue(`> ${index + 1}.`) + chalk.white(`${option}`)); // 현재 선택된 항목에 화살표 표시
        } else {
            console.log(chalk.blue(`  ${index + 1}.`) + chalk.white(`${option}`));
        }
    });

    // 하단 경계선
    console.log(line);

    //log result
    printLog(logs);

    // 하단 설명
    console.log(chalk.gray('화살표로 옵션을 선택한 뒤 엔터를 누르세요.'));
}

// 유저 입력을 받아 처리하는 함수
function handleUserInput(logs, choice) {

    switch (choice) {
        case '1':
            logs.color = 'green';
            logs.text = '게임을 시작합니다.';

            // 여기에서 새로운 게임 시작 로직을 구현
            startGame();
            return true;
            break;
        case '2':
            console.log(chalk.red('게임을 종료합니다.'));
            // 게임 종료 로직을 구현
            process.exit(0); // 게임 종료
            break;
        default:
            logs.color = 'red';
            logs.text = '올바른 선택을 하세요.';
            return false; // 유효하지 않은 입력일 경우 다시 입력 받음
    }
}

async function selectList(logs, options) {
    let index = 0;

    //로비 출력
    displayLobby(logs, options, index);

    //선택하기
    index = await select(logs, options, index) + 1;  // resolve를 파라미터로 전달

    const result = handleUserInput(logs, String(index));

    if (!result) selectList(logs, options);

}

// 선택하기
function select(logs, options, selectedIndex) {
    return new Promise((resolve) => {
        function handleOptionInput(ch, key) {
            if (key) {
                if (key.name === "up" || key.name === "w") {
                    selectedIndex = (selectedIndex - 1 + options.length) % options.length;
                    displayLobby(logs, options, selectedIndex);
                } else if (key.name === "down" || key.name === "s") {
                    selectedIndex = (selectedIndex + 1) % options.length;
                    displayLobby(logs, options, selectedIndex);
                } else if (key.name === "return") {

                    //입력 설정(입력 이벤트 제거)
                    process.stdin.setRawMode(false);
                    process.stdin.pause();
                    process.stdin.removeListener("keypress", handleOptionInput); // 이벤트 리스너 제거
                    resolve(selectedIndex); // 선택 완료 후 resolve 호출
                } else if (key.ctrl && key.name === "c") {
                    console.log(chalk.red('게임을 종료합니다.'));
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

function printLog(logs) {

    if (logs.color != '') {
        switch (logs.color) {
            case 'red':
                console.log(chalk.red(`${logs.text}`));
                break;
            case 'blue':
                console.log(chalk.blue(`${logs.text}`));
                break;
            case 'green':
                console.log(chalk.green(`${logs.text}`));
                break;
            case 'yellow':
                console.log(chalk.yellow(`${logs.text}`));
                break;

        }
    }
}



// 게임 시작 함수
export async function start() {

    GameManager.reset();
    let logs = { color: '', text: '' };
    let actions = [' 새로운 게임 시작', ' 종료'];

    displayLobby(logs, actions, 0);
    await selectList(logs, actions);
}

// 게임 실행
start();