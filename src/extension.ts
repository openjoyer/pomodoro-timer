import * as vscode from 'vscode';

let statusBar: vscode.StatusBarItem;
let timer: NodeJS.Timeout | null = null;
let seconds = 25 * 60;
let isRunning = false;
let isPaused = false;
let message : vscode.Disposable;

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

function finish() {
    pause();
    vscode.window.showInformationMessage('🎉 Таймер завершён! Перерыв 5 минут');
    seconds = 25 * 60;
    updateDisplay();
}

function updateDisplay() {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    let icon = isRunning ? '🍅' : '💤';
	if(isPaused) {
		icon = '⏸️';
	}
    statusBar.text = `${icon} ${mins}:${secs.toString().padStart(2, '0')}`;
}

export function deactivate() {
    if (timer) {
        clearInterval(timer);
    }
}