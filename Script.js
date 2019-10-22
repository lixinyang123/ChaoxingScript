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
player = null, cannel = "公网1", subjectlist = new Array();


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
                        config.dctNum = 1;
                        config.temp = setTimeout(change_to_answer, config.time * 1.5);
                    }
                    else {
                        //跳转到下一个视频
                        config.temp = null;
                        setTimeout(change_course, config.time * 1.0);
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
    console.log("检测视频状态");
    var frame = document.getElementsByTagName('iframe')[0];
    var doc = frame.contentWindow.document;
    var videostatue = doc.getElementsByClassName('ans-attach-ct').item(config.No);

    if (videostatue.children[0].id == "ext-gen1040") {
        var statue = videostatue.className;
        if (statue.indexOf("ans-job-finished") == -1) {
            console.log("视频未完成");
            return false;
        }
        console.log("视频已完成");
        return true;
    }
    else {
        console.log("没有任务点");
        return true;
    }
}

//获取答题状态
function getsubjectstatue() {
    var frame = document.getElementsByTagName('iframe')[0];
    var doc = frame.contentWindow.document;
    var subjectstatue = doc.getElementsByClassName("ans-attach-ct").item(0);
    var statue = subjectstatue.className;
    if (statue.indexOf("ans-job-finished") == -1) {
        console.log("检测未完成");
        return false;
    }
    console.log("检测已完成");
    return true;
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

        var id = document.getElementsByClassName("currents")[1].parentElement.id;
        id++;
        document.getElementById(id).children[0].getElementsByTagName("a")[0].click();

        config.isChanged = true;
        config.dctNum = 1;
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
        console.warn(err.message);
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
        subjectlist = [];
        config.No = 0;
        config.temp = null;
        setTimeout(change_course, config.time * 5.0);
    }
}

//获取答案
function get_answer(context, q, lable) {
    console.log("q:" + q);
    q = q.trim();

    //将题目存入列表
    console.log("保存题目");
    subjectlist[config.No] = q;

    degelate_get(context, q, lable);
}

//查找答案
function degelate_get(context, q, lable) {
    var url = "https://www.lllxy.net/cxtk/getsubject.ashx?question=" + q;

    var finalurl = encodeURI(url);

    $.ajax({
        type: 'GET',
        url: finalurl,
        dataType: 'jsonp',
        jsonp: "callback",
        async: true,
        jsonpCallback: "jsonpCallback",
        success: function(data) {
            get_state(context, data, lable);
        },
        error: function() {
            console.log("error");
        }
    });

}


//判断get状态并选择答题方式
function get_state(context, ans, lable) {
    console.info("a:" + ans);
    if (ans != null) {
        console.info("按答案选择");
        answer(context, ans, lable);
    }
    else {
        console.info("随机选择");
        answer(context, null, lable);
    }
}


//选择答案
function answer(context, ans, lable) {
    let choices, choice, tmp;
    choices = context.children[1].getElementsByTagName("li");
    if (ans != null) {
        //选择题
        try {
            for (let i = 0; i < choices.length; i++) {
                choice = choices[i].getElementsByTagName("a")[0];
                tmp = choice.innerText.trim();
                if (tmp == ans) {
                    choice.click();
                }
            }
        }
        //判断题
        catch (error) {
            for (let i = 0; i < choices.length; i++) {
                choice = choices[i].getElementsByTagName("b")[0];
                tmp = choice.className.trim();
                if (tmp == ans) {
                    choice.click();
                }
            }
        }

        config.complete = true;
        if (!lable) {
            setTimeout(completed, config.time * 0.6);
        }
        else {
            setTimeout(post_answer, config.time * 5.0);
        }
    }
    //随机答题
    else {
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
            setTimeout(get_right_answer, config.time * 10.0);
        }
        catch (err) {
            setTimeout(get_right_answer, config.time * 10.0);
        }
    }
}



function get_right_answer() {

    document.getElementsByTagName("h1").item(0).innerText = "正在将正确答案存入服务器.....";

    //获取题目列表
    var doc;
    doc = document.getElementsByTagName("iframe")[0].contentWindow.document;
    doc = doc.getElementsByTagName("iframe")[0].contentWindow.document;
    doc = doc.getElementsByTagName("iframe")[0].contentWindow.document;
    var TiMu = doc.getElementsByClassName("TiMu");

    if (config.No < TiMu.length) {

        //type为题目类型 true为选择题，false为判断题
        var result, mark, type = true;
        //选择题
        try {
            result = TiMu[config.No].children[1].getElementsByTagName('div').item(0);
            mark = result.getElementsByTagName("i").item(0).className;
        }
        //判断题
        catch (error) {
            mark = TiMu[config.No].children[1].getElementsByTagName('i').item(1).className;
            type = false;
        }

        if (mark == "fr cuo") {
            console.log("答案错误");
            setTimeout(function() { upload_complate() }, 2000);
        }
        else {
            console.log("答案正确");

            //获取题目
            var q = subjectlist[config.No];
            console.log("q:" + q);

            //获取选择题答案
            if (type) {
                //获取答案
                var select = TiMu[config.No].children[1].getElementsByTagName('div').item(0).children[0].innerText;
                select = select.charAt(select.length - 1);

                //获取选项的列表
                var selects = TiMu[config.No].children[1].getElementsByTagName('li');
                for (var j = 0; j < selects.length; j++) {
                    var sel = selects[j].getElementsByTagName("i").item(0).innerText;
                    if (sel.indexOf(select) != -1) {
                        //获取正确选项的答案
                        var a = selects[j].getElementsByTagName("a").item(0).innerText;
                        console.log("a:" + a);

                        setTimeout(function() { upload_answer(q, a) }, 2000);
                    }

                }
            }
            //获取判断题答案
            else {
                var a = TiMu[config.No].children[1].children[0].getElementsByTagName('i')[0].innerText;
                //判断正确为 ri错误为 wr
                if (a == "√") {
                    a = "ri";
                }
                else {
                    a = "wr";
                }
                console.log("a:" + a);

                setTimeout(function() { upload_answer(q, a) }, 2000);

            }

        }

    }
    else {
        subjectlist = [];
        config.No = 0;
        config.temp = null;
        setTimeout(change_course, config.time * 5.0);
    }

}

//上传答案
function upload_answer(q, a) {

    var url = "https://www.lllxy.net/cxtk/uploadsubject.ashx?question=" + q + "&answer=" + a;

    var finalurl = encodeURI(url);

    $.ajax({
        type: 'GET',
        url: finalurl,
        dataType: 'jsonp',
        async: 'true',
        jsonp: "callback",
        jsonpCallback: "jsonpCallback",
        success: function(data) {
            console.log(data);
            setTimeout(function() { upload_complate() }, 2000);
        },
        error: function() {
            console.log("error");
            setTimeout(function() { upload_complate() }, 2000);
        }
    });
}

//上传完成
function upload_complate() {
    config.No++;
    get_right_answer();
}

//==============================================================


function NoDctPlayer() {
    config.isChanged = false;

    var videoCount = $("iframe").contents().find("iframe").contents().find('video#video_html5_api').length;

    if (videoCount != 0) {

        document.getElementsByTagName("h1").item(0).innerText = "正在刷课.....";
        //如果为找到Player
        player = $("iframe").contents().find("iframe").contents().find('video#video_html5_api')[config.No];

        player.play();

        changePlayLine();

        if (!GetNoDctPlayState()) {
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
                config.No = 0;
                setTimeout(nodct_change_course, config.time * 5);
            }
        }
    }
    //无视频直接跳转
    else {
        config.No = 0;
        setTimeout(nodct_change_course, config.time * 5);
    }


}

//获取视频播放状态
function GetNoDctPlayState() {
    console.log("nodct检测视频状态")
    var frame = document.getElementsByTagName('iframe')[0];
    var doc = frame.contentWindow.document;
    var videostatue = doc.getElementsByClassName('ans-attach-ct').item(config.No);

    if (videostatue.children[0].id == "ext-gen1040") {
        var statue = videostatue.className;
        if (statue.indexOf("ans-job-finished") == -1) {
            console.log("nodct视频未完成");
            return false;
        }
        console.log("nodct视频已完成");
        return true;
    }
    else {
        console.log("nodct没有任务点");
        return true;
    }
}

function nodct_change_course() {
    console.log("nodct跳转课程");
    if (!config.isChanged) {

        var ncells = document.getElementsByClassName("ncells");
        for (var i = 0; i < ncells.length; i++) {
            ncells[i].id = i;
        }

        var id = document.getElementsByClassName("currents")[0].parentElement.id;
        id++;
        document.getElementById(id).children[0].getElementsByTagName("a")[0].click();

        config.isChanged = true;
        setTimeout(change_page, config.time * 5);

    }
}