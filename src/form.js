// 実行ボタン押下
async function getTask(){
    // インジケータ表示
    setTimeout(() => {
        document.getElementById("overlay").style.display = 'block';
        document.getElementById("proc_outline").innerText = '課題取得中';
        document.getElementById("proc_detail").innerText = '';
    }, 0);

    // 課題取得
    const result = await window.electron.getTask();

    // 結果表示
    document.getElementById("result_txt").value = result.resultMsg;

    // 課題件数表示
    const taskCountTable  = document.getElementById('task_count');
    if (result.resultStatus == '0') {
        taskCountTable.rows[1].cells[0].innerHTML = result.notCompatibleCount;
        taskCountTable.rows[1].cells[1].innerHTML = result.processingCount;
        taskCountTable.rows[1].cells[2].innerHTML = result.processedCount;
        taskCountTable.rows[1].cells[3].innerHTML = result.completionCount;
        taskCountTable.rows[1].cells[4].innerHTML = Number(result.notCompatibleCount) +
            Number(result.processingCount) +
            Number(result.processedCount) +
            Number(result.completionCount);
    }else{
        taskCountTable.rows[1].cells[0].innerHTML = '　';
        taskCountTable.rows[1].cells[1].innerHTML = '　';
        taskCountTable.rows[1].cells[2].innerHTML = '　';
        taskCountTable.rows[1].cells[3].innerHTML = '　';
        taskCountTable.rows[1].cells[4].innerHTML = '　';
    };

    // 未対応一覧表示
    const taskListTable  = document.getElementById('task_list');
    while(taskListTable.rows.length > 1){
        taskListTable.deleteRow(taskListTable.rows.length - 1);
    };
    if (result.resultStatus == '0') {
        result.data.forEach(task => {
            const taskRow = taskListTable.insertRow(-1);
            const sir = taskRow.insertCell(-1);
            const created = taskRow.insertCell(-1);
            const customer = taskRow.insertCell(-1);
            const taskVal = taskRow.insertCell(-1);
            sir.innerHTML = task.keyId;
            created.innerHTML = task.created.substring(0, 10);
            const customerName =  task.customFields.find((data) => data.id = '174');
            if (customerName && customerName.value) {
                customer.innerHTML = customerName.value.name;
            }
            taskVal.innerHTML = task.summary;
        });
    }else{
        const taskRow = taskListTable.insertRow(-1);
        const taskCell1 = taskRow.insertCell(-1);
        const taskCell2 = taskRow.insertCell(-1);
        const taskCell3 = taskRow.insertCell(-1);
        const taskCell4 = taskRow.insertCell(-1);
        taskCell1.innerHTML = '　';
        taskCell2.innerHTML = '　';
        taskCell3.innerHTML = '　';
        taskCell4.innerHTML = '　';
    };

    // インジケータ非表示
    setTimeout(() => {
        document.getElementById("overlay").style.display = 'none';
    }, 0);
}

async function outputTaskCount(){
    // インジケータ表示
    setTimeout(() => {
        document.getElementById("overlay").style.display = 'block';
        document.getElementById("proc_outline").innerText = '課題件数の出力中';
        document.getElementById("proc_detail").innerText = '';
    }, 0);

    // ファイル出力
    const taskCountTable  = document.getElementById('task_count');
    const result = await window.electron.outputTaskCount({
        "未対応": taskCountTable.rows[1].cells[0].innerHTML,
        "処理中": taskCountTable.rows[1].cells[1].innerHTML,
        "処理済み": taskCountTable.rows[1].cells[2].innerHTML,
        "完了": taskCountTable.rows[1].cells[3].innerHTML
    });

    // インジケータ非表示
    setTimeout(() => {
        document.getElementById("overlay").style.display = 'none';
    }, 1000);
}
async function outputTaskList(){
    // インジケータ表示
    setTimeout(() => {
        document.getElementById("overlay").style.display = 'block';
        document.getElementById("proc_outline").innerText = '未対応一覧の出力中';
        document.getElementById("proc_detail").innerText = '';
    }, 0);

    // ファイル出力
    const result = await window.electron.outputTaskList();

    // インジケータ非表示
    setTimeout(() => {
        document.getElementById("overlay").style.display = 'none';
    }, 1000);
}
function outputChart(){
    window.open('chart.html', '', 'width=550,height=550,frame=false,resizable=false');
}