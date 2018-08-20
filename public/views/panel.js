/**
 * Created by ali on 8/11/18.
 */
document.addEventListener("DOMContentLoaded", function(event) {
    var account=null;
    var interval=null;
    document.getElementById('login').onclick=function() {
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        if (!username || !password) {
            alert('fill requirements');
            return;
        } else {
            httpRequest("./login", {username: username, password: password}, function (data) {
                getAccountList();
            })
        }
    }
    function httpRequest(url, data, cb) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var response = JSON.parse(xhr.responseText);
                console.log(url,response)
                if (response.data.error) {
                    alert("error . " + response.data.error.message)
                } else {
                    cb(response);
                }
            }
        };
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(data));
    }
    function getAccountList() {
        httpRequest("./getaccounts", {}, function (data) {
            var dropdownaccounts=document.getElementById('accounts');
            var accounts=data.data.accounts;
            var html='';
            for(var i=0;i<accounts.length;i++){
                html+='<div><a style="display: inline-flex;width: 10%;min-width: 0;" id="del-'+accounts[i].id+'" class="dropdown-item close"  href="#" aria-label="Close"><span aria-hidden="true">&times;</span></a>';
                html+='<a style="display: inline-flex; width: 75%;" id="acc-'+accounts[i].id+'" class="dropdown-item"  href="#">'+accounts[i].username+'</a></div>';
            }
            dropdownaccounts.innerHTML=html;
            accounts.forEach(function(acc){
                //for(var i=0;i<accounts.length;i++){
                var elm=document.getElementById('acc-'+acc.id);
                elm.onclick=function () {
                    selectAccount(acc)
                };
                elm=document.getElementById('del-'+acc.id);
                elm.onclick=function () {
                    deleteAccount(acc)
                };
                //}
            })
        })
    }
    window.selectAccount=function(acc) {
        console.log(acc);
        document.getElementById('panel').style.display='inline-block';
        document.getElementById('selected-username').innerHTML=acc.username;
        document.getElementById('sources').value=acc.source.join("\r\n");
        document.getElementById('private').checked=acc.private;
        document.getElementById('twicecomment').checked=acc.twicecomment;
        document.getElementsByName('unfollow').forEach(function(elm){
            if(elm.value==acc.unfollow){
                elm.checked=true;
            }
        })
        document.getElementById('hours').value=acc.hours;
        document.getElementById('limit').value=acc.limit;
        document.getElementById('minimumFollower').value=acc.minimumFollower;
        // var commentHtml='';
        // acc.comments.forEach(function(comment){
        //     commentHtml+='<div class="checkbox"><label><input value="'+comment+'" name="select-comment"  type="checkbox">'+comment+'</label></div>';
        // });
        // document.getElementById('comments').innerHTML=commentHtml;
        document.getElementsByName('actions').forEach(function(elm){
            if(acc.actions.indexOf(elm.value)!=-1||elm.value=='follow'){
                elm.checked=true;
             }else {
                elm.checked=false;
            }
        })
        account=JSON.parse(JSON.stringify(acc));
        showReport();
        updateReport();
        interval=setInterval(updateReport,10000)
        getCommentsList();
    };
    window.deleteAccount=function(acc) {
        var result=confirm("are you sure for delete "+acc.username+" ?");
        if(result){
            httpRequest('./deleteaccount',{accountId:acc._id},function (data) {
                document.getElementById('panel').style.display='none';
                document.getElementById('report').style.display='none';
                getAccountList();
                alert(acc.username+" account deleted")

            });

        }
    };
    document.getElementById('add-comment').onclick=function() {
        var comments=document.getElementById('insert-comments').value.split('\n')
        var cleanComments=cleanArray(comments);
        httpRequest('./insertcomments',{comments:cleanComments},function () {
            getCommentsList();
        });
    };
    function cleanArray(arr) {
       var cleanArr=[];
        arr.forEach(function(item){
            if(item){
                cleanArr.push(item)
            }
        })
        return cleanArr;
    }
    document.getElementById('save-setting').onclick=function() {
        let acc= {
            source:cleanArray(document.getElementById('sources').value.split("\n")),
            private:document.getElementById('private').checked,
            twicecomment:document.getElementById('twicecomment').checked,
            unfollow:getRadioValue('unfollow','no'),
            hours:document.getElementById('hours').value,
            limit:document.getElementById('limit').value,
            minimumFollower:document.getElementById('minimumFollower').value,
            actions:getCheckValue('actions'),
            comments:getCheckValue('select-comment'),
            _id:account._id
        };
        var error='';
        Object.keys(acc).forEach(function (key) {
            if(key!=='actions'&&key!=='comments') {
                if (Array.isArray(acc[key])) {
                    if (acc[key].length == 0) {
                        error += (key + " field is not fill") + '\r\n';
                    }
                } else {
                    //  console.log(acc[key]===undefined,acc[key]=='', typeof acc[key]==='undefiend',key,acc[key])
                    if (acc[key] === undefined || typeof acc[key] === 'undefiend') {
                        error += (key + " field is not fill") + '\r\n';
                    }
                }
            }
            else if(key==='actions'){
                if (acc[key].length<1) {
                    error += (key + " please select minimum two action") + '\r\n';
                }
            }
            else if(key==='comments'){
                if(acc['actions'].indexOf('comment')!=-1) {
                    if (acc[key].length == 0) {
                        error += (key + " field is not fill") + '\r\n';
                    }
                }
            }
        })
        if(error){
            alert(error)
        }else{
            httpRequest('./savesetting',{setting:acc},function (data) {
                console.log(data.data.account)
                account=data.data.account;
                showReport();
            });
        }
    };
    function showReport(){
        document.getElementById('report').innerHTML='';

        var html=`<div class="container">
                <div class="row">
                    <div class="col-3">
                        <img id="report-image" class="my-rounded-circle" src="https://scontent-frx5-1.cdninstagram.com/vp/eaf4663b993b22ab3c90681222cba10e/5C0B007A/t51.2885-19/11906329_960233084022564_1448528159_a.jpg">
                        <div class="input-group-prepend">
                            <span id="report-username" class="input-group-text"></span>
                        </div>
                        <div class="input-group-prepend">
                            <span id="report-name" class="input-group-text"></span>
                        </div>
                        <div>
                            <button id="start-follow" type="button"  class="btn active"><code>start</code></button>
                            <button id="stop-follow" type="button"  style="display: none;" class="btn active"><code>stop</code></button>
                        </div>
                    </div>
                    <div class="col-9">
                        <div id="total" class="container">
                    </div>
                </div>
                </div>
            </div>
                <div id="report-details" class="container">
                </div>`;

        if(account.step=="running") {
            document.getElementById('report').innerHTML=html;
            document.getElementById('start-follow').style.display = "none"
            document.getElementById('stop-follow').style.display = "inline-block"
            document.getElementById('report').style.display = 'inline-block';
            document.getElementById('report-image').src = account.image
            document.getElementById('report-username').innerHTML = '<a target="_blank" href="http://instagram.com/' + account.username + '">' + account.username + '</a>';
            document.getElementById('report-name').innerHTML = account.fullName

        }else if(account.source.length>0) {
            document.getElementById('report').innerHTML=html;
            document.getElementById('start-follow').style.display = "inline-block"
            document.getElementById('stop-follow').style.display = "none"
            document.getElementById('report').style.display = 'inline-block';
            document.getElementById('report-image').src = account.image
            document.getElementById('report-username').innerHTML = '<a target="_blank" href="http://instagram.com/' + account.username + '">' + account.username + '</a>';
            document.getElementById('report-name').innerHTML = account.fullName
        }
        if(document.getElementById('start-follow')){
            document.getElementById('start-follow').onclick=function() {
                let acc= {
                    source:cleanArray(document.getElementById('sources').value.split("\n")),
                    private:document.getElementById('private').checked,
                    twicecomment:document.getElementById('twicecomment').checked,
                    unfollow:getRadioValue('unfollow','no'),
                    hours:document.getElementById('hours').value,
                    limit:document.getElementById('limit').value,
                    minimumFollower:document.getElementById('minimumFollower').value,
                    comments:getCheckValue('select-comment'),
                    actions:getCheckValue('actions'),
                    _id:account._id
                };
                var error='';
                Object.keys(acc).forEach(function (key) {
                    if(Array.isArray(acc[key])){
                        if(acc[key].length==0){
                            error+=(key+" field is not fill")+'\r\n';
                        }
                    }else{
                        console.log(acc[key]===undefined,acc[key]=='', typeof acc[key]==='undefiend',key,acc[key])
                        if(acc[key]===undefined|| typeof acc[key]==='undefiend'){
                            error+=(key+" field is not fill")+'\r\n';
                        }
                    }
                })
                if(error){
                    alert(error)
                }else {
                    httpRequest('./followprocess', {username: account.username, step: 'running'}, function (data) {
                        account = data.data.account;
                        document.getElementById('start-follow').style.display = "none"
                        document.getElementById('stop-follow').style.display = "inline-block"
                        alert("process started")
                    })
                }
            };
            document.getElementById('stop-follow').onclick=function() {
                httpRequest('./followprocess',{username:account.username,step:'stop'},function (data) {
                    account=data.data.account;
                    document.getElementById('stop-follow').style.display="none"
                    document.getElementById('start-follow').style.display="inline-block"
                    alert("process stop")
                })
            };
        }
    };
    // document.getElementById('start-follow').onclick=function() {
    //     let acc= {
    //         source:cleanArray(document.getElementById('sources').value.split("\n")),
    //         private:document.getElementById('private').checked,
    //         twicecomment:document.getElementById('twicecomment').checked,
    //         unfollow:getRadioValue('unfollow','no'),
    //         hours:document.getElementById('hours').value,
    //         limit:document.getElementById('limit').value,
    //         minimumFollower:document.getElementById('minimumFollower').value,
    //         comments:getCheckValue('select-comment'),
    //         actions:getCheckValue('actions'),
    //         _id:account._id
    //     };
    //     var error='';
    //     Object.keys(acc).forEach(function (key) {
    //         if(Array.isArray(acc[key])){
    //             if(acc[key].length==0){
    //                 error+=(key+" field is not fill")+'\r\n';
    //             }
    //         }else{
    //             console.log(acc[key]===undefined,acc[key]=='', typeof acc[key]==='undefiend',key,acc[key])
    //             if(acc[key]===undefined|| typeof acc[key]==='undefiend'){
    //                 error+=(key+" field is not fill")+'\r\n';
    //             }
    //         }
    //     })
    //     if(error){
    //         alert(error)
    //     }else {
    //         httpRequest('./followprocess', {username: account.username, step: 'running'}, function (data) {
    //             account = data.data.account;
    //             document.getElementById('start-follow').style.display = "none"
    //             document.getElementById('stop-follow').style.display = "inline-block"
    //             alert("process started")
    //         })
    //     }
    // };
    // document.getElementById('stop-follow').onclick=function() {
    //     httpRequest('./followprocess',{username:account.username,step:'stop'},function (data) {
    //         account=data.data.account;
    //         document.getElementById('stop-follow').style.display="none"
    //         document.getElementById('start-follow').style.display="inline-block"
    //         alert("process stop")
    //     })
    // };
    function getRadioValue(name,defaultValue) {
        var radios = document.getElementsByName(name);
        for (var i = 0, length = radios.length; i < length; i++)
        {
            if (radios[i].checked)
            {
               defaultValue=radios[i].value;
               break;
            }
        }
        return defaultValue;
    }
    function getCheckValue(name) {
        var check = document.getElementsByName(name);
        var answers=[];
        for (var i = 0, length = check.length; i < length; i++)
        {
            if (check[i].checked)
            {
                answers.push(check[i].value);
            }
        }
        return answers;
    }
    function getCommentsList() {
        httpRequest("./getcomments", {}, function (data) {
            console.log(data)
            var dropdowncomments=document.getElementById('comments');
            var comments=data.data.comments;
            var commentHtml='';
            comments.forEach(function(comment){
                if(account.comments.indexOf(comment.comment)!=-1){
                    commentHtml+=' <button type="button" onclick="deleteComment(\''+comment._id+'\')" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                        '<div class="checkbox"><label><input checked value="'+
                        comment.comment+'" name="select-comment"  type="checkbox"><span class="checkbox-decorator"><span class="check"></span></span>'
                        +comment.comment+'</label></div>';
                }else{
                    commentHtml+=' <button type="button" onclick="deleteComment(\''+comment._id+'\')" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                        '<div class="checkbox"><label><input value="'
                        +comment.comment+'" name="select-comment"  type="checkbox"><span class="checkbox-decorator"><span class="check"></span></span>'
                        +comment.comment+'</label></div>';
                }
            });
           dropdowncomments.innerHTML=commentHtml;
        })
    }
    window.deleteComment=function (_id) {
        httpRequest('./deletecomment',{commentId:_id},function (data) {
            getCommentsList();
        });
    }
    getAccountList();
    function updateReport(){
        httpRequest('./report',{username:account.username},function (data) {
            document.getElementById('total').innerHTML=getReportHtml(data.data.report.total);
            var detailHtml='';
            for(var i=0;i<data.data.report.details.length;i++){
                detailHtml+=getReportHtml(data.data.report.details[i]);
            }
           document.getElementById('report-details').innerHTML=detailHtml;
        });
    }
    function getReportHtml(report) {
        var html='';
        Object.keys(report).forEach(function (item) {
            if(item!=='source') {
                html+='<div class="col"><div  class="row">' + item + '</div><div class="row">' + report[item] + '</div></div>'
            }
        })
        var html='<div class="row report-tag"><div class="col"><a target="_blank" href="http://instagram.com/'+report.source+'">@'+report.source+'</a></div></div>' +
            ' <div class="row report-detail">'+html+'</div>'
        return html;
    }
});
