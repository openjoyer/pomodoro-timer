import * as vscode from 'vscode';

let statusBar: vscode.StatusBarItem;
let timer: NodeJS.Timeout | null = null;
let seconds = 25 * 60;
let isRunning = false;
let isPaused = false;
let message : vscode.Disposable;

/**
 * Функция активации расширения (вызывается при запуске VS Code)
 * Параметры: context - контекст расширения для управления подписками и ресурсами
 */
export function activate(context: vscode.ExtensionContext) {
    statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.command = 'pomodoro.toggle';
    statusBar.text = '🍅 25:00';
    statusBar.tooltip = 'Нажми для старта';
    statusBar.show();

    let toggle = vscode.commands.registerCommand('pomodoro.toggle', () => {
        if (isRunning) {
            pause();
        } else {
            start();
        }
    });

    context.subscriptions.push(toggle, statusBar);
}

/**
 * Запускает таймер обратного отсчёта
 */
function start() {
    isRunning = true;
	isPaused = false;
	if(message) {
		message.dispose();
	}
    statusBar.tooltip = 'Нажми для паузы';
	updateDisplay();
    
    timer = setInterval(() => {
        seconds--;
        updateDisplay();
        
        if (seconds <= 0) {
            finish();
        }
    }, 1000);
}

/**
 * Ставит таймер на паузу (останавливает отсчёт)
 */
function pause() {
    isRunning = false;
	isPaused = true;
	if(message) {
		message.dispose();
	}
	updateDisplay();
	message = vscode.window.setStatusBarMessage('⏸️ Таймер на паузе');
    statusBar.tooltip = 'Нажми для продолжения';
    
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

/**
 * Завершает сессию таймера (показывает уведомление и сбрасывает время)
 */
function finish() {
    isRunning = false;
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    vscode.window.showInformationMessage('🎉 Таймер завершён! Перерыв 5 минут');
    seconds = 25 * 60;
    updateDisplay();
}

/**
 * Обновляет отображение таймера в статус-баре
 * Вычисляет минуты и секунды, выбирает иконку и форматирует текст
 */
function updateDisplay() {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    let icon = isRunning ? '🍅' : '💤';
	if(isPaused) {
		icon = '⏸️';
	}
    statusBar.text = `${icon} ${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Функция деактивации расширения (вызывается при выключении)
 * Очищает ресурсы и останавливает таймер
 */
export function deactivate() {
    message.dispose();
    if (timer) {
        clearInterval(timer);
    }
}