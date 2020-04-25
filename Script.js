var config = {
    muted: false,				//静音播放
    time: 1000,				    //时间
    auto_answer: true,		//自动答题，默认开启
    auto_change: true,		//自动跳课，默认开启
    random: true,				//随机答题，默认开启

    isStart: false,			//点击标记
    isChanged: false,			//切换标记
    changing: false,           //切换标记
    cycle: null,				//循环标记
    dctNum: 1,                  //dct序号
    dctVideo: 0,                //视频页面dct序号
    No: 0,						//题号
    complete: false,			//答题标记
    temp: null					//分配标记
},
player = null, cannel = "公网1";


//检测是否存在播放器
function check_player() {

    document.getElementsByTagName("h1").item(0).innerText = "正在刷课.....";
    //如果为找到Player
    if (player == null) {
        //获取视频个数
        var videoCount = $("iframe").contents().find("iframe").contents().find('video#video_html5_api').length;
        if (videoCount == 0) {
            setTimeout(check_player, config.time * 0.5);
        }
        else {
            //如果下方还有视频
            if (config.No <= videoCount - 1) {
                //寻找播放器
                player = $("iframe").contents().find("iframe").contents().find('video#video_html5_api')[config.No];
                //间隔指定时间后执行check_player
                setTimeout(check_player, config.time * 0.5);
            }
            //下方没有视频，开始答题
            else {
                console.log("跳转到答题页");
                config.No = 0;
                config.isChanged = false;
                clearTimeout(config.cycle);
                if (config.temp == null) {
                    //是否自动答题
                    if (config.auto_answer) {
                        config.temp = setTimeout(change_to_answer, config.time * 1.5);
                    }
                    else {
                        //跳转到下一个视频
                        setTimeout(change_course, config.time * 5);
                    }
                }
            }
        }

    }
    else //如果已经获取Player
    {
        //尝试获取播放组件 添加播放事件 将播放状态改为true 并执行start方法
        try {
            var blr = $("iframe").contents().find("iframe").contents().find("div.vjs-poster")[0];
            blr.addEventListener("blur", function() { player.play(); });
            config.isStart = true;
            //等待指定时间执行start方法
            setTimeout(start, config.time * 2.0);
        }
        //捕获异常提示并重新执行Check_Player方法
        catch (err) {
            console.warn(err.message);
            config.isStart = false;
            setTimeout(check_player, config.time * 2.0);
        }
    }
}

//开始播放
function start() {
    if (player == null) {
        check_player();
    }
    else {
        if (!config.changing) //如果视频暂停且不需要切换下一集
        {
            //播放视频
            player.play();
            changePlayLine();
            config.dctVideo = config.dctNum;
        }
        //设置是否静音播放
        if (config.muted && !player.muted) {
            player.muted = true;
        }
        //如果视频任务点完成
        if (getvideostatue()) {

            console.log("播放下方视频");
            player = null;
            config.No++;
            check_player();
        }
        config.cycle = setTimeout(start, config.time * 0.6);
    }
}

//切换播放源
function changePlayLine() {

    console.log("切换播放路线");

    //获取当前播放路线
    var currentPlayLine = player.parentElement.getElementsByClassName("vjs-control-bar")[0].getElementsByClassName("vjs-playline-button")[0].children[2].innerText;

    //切换到正确的播放路线
    if (currentPlayLine != cannel) {
        var playlineList = player.parentElement.getElementsByClassName("vjs-control-bar")[0].getElementsByClassName("vjs-playline-button")[0].children[1].children[0].getElementsByTagName("li");
        for (var i = 0; i < playlineList.length; i++) {
            if (playlineList[i].innerText == cannel) {
                playlineList[i].click();
            }
        }
    }
}

//获取视频播放状态
function getvideostatue() {
    try {
        console.log("检测视频状态");
        var frame = document.getElementsByTagName('iframe')[0];
        var doc = frame.contentWindow.document;
        var videostatue = doc.getElementsByClassName('ans-attach-ct').item(config.No);

        var statue = videostatue.className;
        if (statue.indexOf("ans-job-finished") == -1) {
            console.log("视频未完成");
            return false;
        }
        console.log("视频已完成");
        return true;
    } 
    catch (error) {
        console.log("获取视频状态异常，跳过此视频");
        return true;
    }
}

//获取答题状态
function getsubjectstatue() {
    try {
        var frame = document.getElementsByTagName('iframe')[0];
        var doc = frame.contentWindow.document;
        var subjectstatue = doc.getElementsByClassName("ans-attach-ct").item(0);
        var statue = subjectstatue.className;
        if (statue.indexOf("ans-job-finished") == -1) {
            console.warn("检测未完成");
            return false;
        }
        console.warn("检测已完成");
        return true;
    } 
    catch (error) {
        console.log("获取答题状态异常，跳过此答题页");
        return true;
    }
}

//点开始刷课按钮（脚本入口）
function btn_start() {
    change_page();
}

//更改课程
function change_course() {
    console.log("跳转课程");
    if (!config.isChanged) {

        var ncells = document.getElementsByClassName("ncells");
        for (var i = 0; i < ncells.length; i++) {
            ncells[i].id = i;
        }

        var id = document.getElementById("coursetree").getElementsByClassName("currents")[0].parentElement.id;
        id++;
        document.getElementById(id).children[0].getElementsByTagName("a")[0].click();

        config.isChanged = true;
        config.dctNum = 1;
        config.No = 0;
        config.temp = null;
        setTimeout(change_page, config.time * 2.5);

    }
}

//更改页面
function change_page() {
    console.log("检测视频页面");
    try {
        let blk = document.getElementById("dct" + config.dctNum);
        if (blk.title == "视频" || blk.title == "课程" || blk.title == "") {
            blk.click();
            config.changing = false;
            player = undefined;
            setTimeout(check_player, config.time * 1.5);
        }
        else {
            config.dctNum++;
            setTimeout(change_page, 500);
        }
    }
    catch (err) {
        setTimeout(NoDctPlayer, config.time * 1.5);
    }
}

//切换到检测页面
function change_to_answer() {
    config.dctNum = 1;
    try {
        //获取播放视频页面
        var dctAnswer = config.dctVideo + 1;
        var blk = document.getElementById("dct" + dctAnswer);
        
        blk.click();
        config.changing = false;
        player = undefined;
        //开始答题
        setTimeout(distribute, config.time * 5.0);
    }
    catch (err) {
        setTimeout(change_course, config.time * 5);
    }
}

//单次答题完成
function completed() {
    if (!config.complete)
        setTimeout(completed, config.time * 0.6);
    else {
        config.complete = false;
        config.No += 1;
        setTimeout(distribute, config.time * 1.0);
    }
}

//答题
function distribute() {

    //检测未完成
    if (getsubjectstatue() == false) {
        let TiMu, len, q;
        //获取存放题目的div
        TiMu = $("iframe").contents().find("iframe").contents().find("iframe").contents().find("div.TiMu");
        //获取题目数量
        len = TiMu.length;
        if (config.No < (len - 1)) {
            try {
                q = TiMu[config.No].children[0].getElementsByTagName('div')[0].innerText || TiMu[config.No].children[0].getElementsByTagName("p");
                q = q.trim();
                get_answer(TiMu[config.No], q, false);
            }
            catch (err) {
                console.warn(err.message);
                setTimeout(distribute, config.time * 2.0);
            }
        }
        else {
            try {
                q = TiMu[len - 1].children[0].children[1].innerText
                    || TiMu[len - 1].children[0].getElementsByTagName("p");
                q = q.trim();
                get_answer(TiMu[len - 1], q, true);
            }
            catch (err) {
                console.warn(err.message);
                setTimeout(distribute, config.time * 1.0);
            }
        }
    }
    //检测已完成
    else {
        setTimeout(change_course, config.time * 5);
    }
}

//获取答案
function get_answer(context, q, lable) {
    console.log("q:" + q);
    q = q.trim();
    degelate_get(context, q, lable);
}

//查找答案
function degelate_get(context, q, lable) {
    var url = "https://www.lllxy.net/cxtkproxy?" + q;

    var finalurl = encodeURI(url);

    $.ajax({
        type: 'GET',
        url: finalurl,
        success: function(data) {
            answer(context, data.data.answer, lable);
        },
        error: function() {
            console.error("error--重新查找");
            get_answer(context, q, lable);
        }
    });

}

//选择答案
function answer(context, ans, lable) {
    console.log("a:"+ans);

    let choices, choice, tmp, isChoiced = false;
    choices = context.children[1].getElementsByTagName("li");
    if (ans != null) {
        //选择题
        try {
            for (let i = 0; i < choices.length; i++) {
                choice = choices[i].getElementsByTagName("a")[0];
                tmp = choice.innerText.trim();
                if (tmp.includes(ans) || ans.includes(tmp)) {
                    choice.click();
                    isChoiced = true;
                }
            }
        }
        //判断题
        catch (error) {
            if(ans.includes("是")||ans.includes("正确")||ans.includes("对")){
                ans = "ri";
            }
            else{
                ans = "wr";
            }

            for (let i = 0; i < choices.length; i++) {
                choice = choices[i].getElementsByTagName("b")[0];
                tmp = choice.className.trim();
                if (tmp == ans) {
                    choice.click();
                    isChoiced = true;
                }
            }
        }

        if(isChoiced){
            console.log("按答案选择");
            config.complete = true;
            if (!lable) {
                setTimeout(completed, config.time * 0.6);
            }
            else {
                setTimeout(post_answer, config.time * 5.0);
            }
        }
        else{
            console.log("答案与选项不匹配，随机选择");
            randomAnswer(choices,lable);
        }
    }
    else {
        console.log("题库无答案，随机选择");
        randomAnswer(choices,lable);
    }
}

//随机答题
function randomAnswer(choices,lable){
    try {
        choices[Math.floor(Math.random() * (choices.length - 0.1))]
            .getElementsByTagName("a")[0].click();
    }
    catch (error) {
        choices[Math.floor(Math.random() + 0.5)]
            .getElementsByTagName("b")[0].click();
    }

    config.complete = true;
    if (!lable) {
        setTimeout(completed, config.time * 0.6);
    }
    else {
        setTimeout(post_answer, config.time * 5.0);
    }
}

//提交答案
function post_answer() {
    config.No = 0;
    //检测未完成
    let sub = $("iframe").contents().find("iframe").contents().find("iframe").contents()
        .find("div#ZyBottom")[0].getElementsByClassName("ZY_sub clearfix")[0];
    sub.getElementsByTagName("a")[1].click();
    setTimeout(confirm_sub, config.time * 0.6);

}

//确认提交
function confirm_sub() {
    if (config.auto_answer) {
        try {
            $("iframe").contents().find("iframe").contents().find("iframe").contents()
                .find("div.con03")[0].getElementsByTagName("a")[0].click();
            setTimeout(change_course, config.time * 5);
        }
        catch (err) {
            setTimeout(change_course, config.time * 5);
        }
    }
}

//==============================================================


function NoDctPlayer() {
    console.log("NoDctPlayer");
    config.isChanged = false;

    var videoCount = $("iframe").contents().find("iframe").contents().find('video#video_html5_api').length;

    if (videoCount != 0) {

        document.getElementsByTagName("h1").item(0).innerText = "正在刷课.....";
        //如果为找到Player
        player = $("iframe").contents().find("iframe").contents().find('video#video_html5_api')[config.No];

        player.play();

        changePlayLine();

        if (!getvideostatue()) {
            setTimeout(NoDctPlayer, config.time * 1);
        }
        //如果视频播放完成
        else {
            //播放下方视频
            config.No++;
            if (config.No < videoCount) {
                setTimeout(NoDctPlayer, config.time * 5);
            }
            //无下方视频，恢复当前视频索引并跳转
            else {
                setTimeout(change_course, config.time * 5);
            }
        }
    }
    //无视频直接跳转
    else {
        distribute();
    }
}
