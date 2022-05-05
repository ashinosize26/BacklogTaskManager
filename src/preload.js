const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
    'electron',
    {
      getTask: async () => {
        console.log('send message: getTask');
        const res = await ipcRenderer.invoke('getTask');
        console.log('response :', res);
        return res;
      },
      outputTaskCount: async(arg) => {
        const res = await ipcRenderer.invoke('outputTaskCount', arg);
        return res;
      },
      outputTaskList: async() => {
        const res = await ipcRenderer.invoke('outputTaskList');
        return res;
      }
    }
  );