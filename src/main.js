const {app, BrowserWindow, Menu, ipcMain} = require('electron');
const path = require('path')
const axios = require('axios');
const fs = require('fs');

let mainWindow;
let taskList;
const sleep = (second) => new Promise(resolve => setTimeout(resolve, second * 1000));

// 起動時
app.on('ready', function() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 650,
        icon: path.join(__dirname, 'images/icon.png'),
        resizable:false,
        frame:false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    mainWindow.loadURL(path.join(__dirname, 'index.html'));
    Menu.setApplicationMenu(null);
    mainWindow.on('closed', function() {
        mainWindow = null;
    });

    // debug用
    // mainWindow.openDevTools();
});

// 閉じる
app.on('window-all-closed', function() {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

// 課題取得
ipcMain.handle('getTask', async (event) => {
    console.log('receive message: getTask');

    // 設定読み出し
    const backlogSetting = JSON.parse(fs.readFileSync('./setting.json', 'utf8')).backlog;

    try{
        // 課題数の取得
        const resNotCompatibleCount = await axios.get(`http://${backlogSetting.space}/api/v2/issues/count`,{
            params: {
                apiKey: backlogSetting.apiKey,
                projectId: [backlogSetting.projectId],
                issueTypeId: [backlogSetting.issueTypeId],
                statusId: [backlogSetting.statusId.notCompatible],
                createdSince: backlogSetting.createdSince,
                createdUntil: backlogSetting.createdUntil
            }
        });
        const resProcessingCount = await axios.get(`http://${backlogSetting.space}/api/v2/issues/count`,{
            params: {
                apiKey: backlogSetting.apiKey,
                projectId: [backlogSetting.projectId],
                issueTypeId: [backlogSetting.issueTypeId],
                statusId: [backlogSetting.statusId.processing],
                createdSince: backlogSetting.createdSince,
                createdUntil: backlogSetting.createdUntil
            }
        });
        const resProcessedCount = await axios.get(`http://${backlogSetting.space}/api/v2/issues/count`,{
            params: {
                apiKey: backlogSetting.apiKey,
                projectId: [backlogSetting.projectId],
                issueTypeId: [backlogSetting.issueTypeId],
                statusId: [backlogSetting.statusId.processed],
                createdSince: backlogSetting.createdSince,
                createdUntil: backlogSetting.createdUntil
            }
        });
        const resCompletionCount = await axios.get(`http://${backlogSetting.space}/api/v2/issues/count`,{
            params: {
                apiKey: backlogSetting.apiKey,
                projectId: [backlogSetting.projectId],
                issueTypeId: [backlogSetting.issueTypeId],
                statusId: [backlogSetting.statusId.completion],
                createdSince: backlogSetting.createdSince,
                createdUntil: backlogSetting.createdUntil
            }
        });

        // 未対応の課題情報取得
        const resNotCompatibleTask = await axios.get(`http://${backlogSetting.space}/api/v2/issues`,{
            params: {
                apiKey: backlogSetting.apiKey,
                projectId: [backlogSetting.projectId],
                issueTypeId: [backlogSetting.issueTypeId],
                statusId: [backlogSetting.statusId.notCompatible],
                createdSince: backlogSetting.createdSince,
                createdUntil: backlogSetting.createdUntil,
                count: backlogSetting.count
            }});
        taskList = resNotCompatibleTask.data;
        return {
            resultStatus: '0',
            resultMsg: 'Success!',
            notCompatibleCount: resNotCompatibleCount.data.count,
            processingCount: resProcessingCount.data.count,
            processedCount: resProcessedCount.data.count,
            completionCount: resCompletionCount.data.count,
            data: resNotCompatibleTask.data
        };
    } catch (err){
        return {resultStatus: '9', resultMsg: `Error! ${err.message}`};
    }
})

// ファイル出力（件数）
ipcMain.handle('outputTaskCount', async (event, arg) => {
    console.log('receive message: outputTaskCount');
    console.log(`arg:${arg}`);

    // 設定読み出し
    const folderPath = JSON.parse(fs.readFileSync('./setting.json', 'utf8')).output.taskCount.path;

    // ファイル出力
    const dateObj = new Date();
    const dateText = dateObj.getFullYear() +
        ('00' + (dateObj.getMonth() + 1)).slice(-2) +
        ('00' + dateObj.getDate()).slice(-2) +
        ('00' + dateObj.getHours()).slice(-2) +
        ('00' + dateObj.getMinutes()).slice(-2) +
        ('00' + dateObj.getSeconds()).slice(-2);
    const jsonData = JSON.stringify(arg, null, 2);
    fs.writeFileSync(path.join(folderPath, `TaskCount_${dateText}.json`), jsonData);
})

// ファイル出力（未対応一覧）
ipcMain.handle('outputTaskList', async (event) => {
    console.log('receive message: outputTaskList');

    // 設定読み出し
    const folderPath = JSON.parse(fs.readFileSync('./setting.json', 'utf8')).output.taskList.path;

    // ファイル出力
    if (taskList) {
        const dateObj = new Date();
        const dateText = dateObj.getFullYear() +
            ('00' + (dateObj.getMonth() + 1)).slice(-2) +
            ('00' + dateObj.getDate()).slice(-2) +
            ('00' + dateObj.getHours()).slice(-2) +
            ('00' + dateObj.getMinutes()).slice(-2) +
            ('00' + dateObj.getSeconds()).slice(-2);
        const jsonData = JSON.stringify(taskList, null, 2);
        fs.writeFileSync(path.join(folderPath, `TaskList_${dateText}.json`), jsonData);
    }
})