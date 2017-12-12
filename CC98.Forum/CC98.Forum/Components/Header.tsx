﻿import * as React from 'react';
import * as Utility from '../Utility';
import { AppState } from '../States/AppState';
import * as $ from 'jquery';
import { connect } from 'react-redux';
import { userLogOff } from '../Actions';
import { Link } from 'react-router-dom';

class DropDownConnect extends React.Component<{ isLogOn, userInfo, logOff }, { userName, userImgUrl, hoverElement }> {   //顶部条的下拉菜单组件
    constructor(props?, context?) {
        super(props, context);
        this.state = ({
            userName: "载入中……",
            userImgUrl: "/images/unLoggedOn.png",
            hoverElement: null
        });
    }
    componentDidMount() {
        let userName = this.props.userInfo.name;
        let userImgUrl = this.props.userInfo.portraitUrl;
        this.setState({ userName: userName, userImgUrl: userImgUrl });
                

        //以下是明一写的signalr，有锅找他
        /*var chat = $.connection.messageHub;
        console.log("signal通知测试");
        $.connection.hub.url = "http://apitest.niconi.cc/signalr";
        var token = Utility.getLocalStorage("accessToken");
        console.log(`signalr的${token}`);
        $.connection.hub.qs = {
            'Authorization': token
        };
        $.connection.hub.logging = "true";
        chat.client.newUserMessage = view;
        console.log($.connection);
        console.log($.connection.hub);
        console.log($.connection.hub.start());
        $.connection.hub.start();
        console.log("signal测试完毕");*/
    }
    
    logOff() {
        Utility.removeLocalStorage("accessToken");
        console.log("after remove token=" + Utility.getLocalStorage("accessToken"));
        Utility.removeLocalStorage("userName");
        Utility.removeLocalStorage("password");
        Utility.removeLocalStorage("userInfo");
        Utility.removeStorage("all");
        this.props.logOff();            //更新redux中的状态
    }

    handleMouseEvent(type, className) {
        switch (type) {
            case 'mouseover': {
                this.setState({
                    hoverElement: className
                });
                break;
            }
            case 'mouseout': {
                this.setState({
                    hoverElement: null
                });
                break;
            }
        }
    }

    render() {
        if (this.props.isLogOn) {
            $(document).ready(function () {
                const dropDownSub = $('.dropDownSub').eq(0);
                const dropDownLi = dropDownSub.find('li');
                const dropDownSubMessage = $('.dropDownSubMessage').eq(0);
                const dropDownLiMessage = dropDownSubMessage.find('li');                
                dropDownLi.mouseover(function () {
                    this.className = 'hover';
                });
                dropDownLi.mouseout(function () {
                    this.className = '';
                });
                dropDownLiMessage.mouseover(function () {
                    this.className = 'hover';
                });
                dropDownLiMessage.mouseout(function () {
                    this.className = '';
                });
            });

            const style = {
                display: 'block',
                transitionDuration: '.2s',
                height: '0px'
            };
            return (<div id="dropdown">
                <div className="box">
                    <div className="userInfo">
                        <div className="userImg"><img src={this.props.userInfo.portraitUrl||this.state.userImgUrl}></img></div>
                        <div
                            className="userName"
                            onMouseOut={(e) => { this.handleMouseEvent(e.type, "userName"); }}
                            onMouseOver={(e) => { this.handleMouseEvent(e.type, "userName"); }}
                        >{this.state.userName}</div>
                    </div>
                    <div className="topBarText"> <Link to="/" style={{ color: '#fff' }}>首页</Link></div>
                    <div
                        className="topBarText"
                        id="userMessage"
                        onMouseOut={(e) => { this.handleMouseEvent(e.type, 'topBarText'); }}
                        onMouseOver={(e) => { this.handleMouseEvent(e.type, 'topBarText'); }}
                    > <Link to="/message/response" className="messageTopBar">消息<div className="message-counter">99</div></Link></div>     
                    <div className="topBarText"> <Link to="/focus" style={{ color: '#fff' }}>关注</Link></div>
                    <div className="topBarText"> <Link to="/newTopics" style={{ color: '#fff' }}>新帖</Link></div>
                    <Link to="/boardList"><div className="boardListLink" style={{ margin: '0 0 0 10px' }}><div style={{ marginTop: '16px', color: '#fff' }}>版面</div></div></Link>
                </div>
                <div
                    className="dropDownSubBox"
                    onMouseOut={(e) => { this.handleMouseEvent(e.type, "userName"); }}
                    onMouseOver={(e) => { this.handleMouseEvent(e.type, "userName"); }}
                    style={{ ...style, overflow: 'hidden', height: this.state.hoverElement ==='userName'?'90px':'0px' }}
                >
                    <ul className="dropDownSub" style={{ display: 'inherit'}}>
                        <Link to="/userCenter"> <li>个人中心</li></Link>
                        <Link to="/signin"><li>签到</li></Link>
                        <li onClick={this.logOff.bind(this)}>注销</li>
                    </ul>
                </div>
                <div
                    className="dropDownSubBoxMessage"
                    onMouseOut={(e) => { this.handleMouseEvent(e.type, "topBarText"); }}
                    onMouseOver={(e) => { this.handleMouseEvent(e.type, "topBarText"); }}
                    style={{...style, overflow: 'hidden', zIndex: 100 , position: 'absolute', top: '55px', height: this.state.hoverElement === 'topBarText' ? '120px' : '0px'}}
                >
                    <ul className="dropDownSubMessage" style={{ display: 'inherit' }}>
                        <Link to="/message/response"><li>回复我的</li></Link>
                        <Link to="/message/attme"><li>@ 我的</li></Link>
                        <Link to="/message/system"><li>系统通知</li></Link>
                        <Link to="/message/message"><li>我的私信</li></Link>
                    </ul>
                </div>
            </div>);
        }
        else {
            return <div id="dropdown">
                <div className="box">
                    <div className="topBarText" style={{ margin: '0 10px 0 10px' }}> <Link to="/" style={{ color: '#fff' }}>首页</Link></div>
                    <div className="topBarText" style={{ margin: '0 10px 0 10px' }}> <Link to="/logOn" style={{ color: '#fff' }}>登录</Link></div>
                    <div className="topBarText" style={{ margin: '0 10px 0 10px' }}> <Link to="/newTopics" style={{ color: '#fff' }}>新帖</Link></div>
                    <Link to="/boardList"><div className="boardListLink" style={{ margin: '0 0 0 10px' }}><div style={{ marginTop: '16px', color: '#fff' }}>版面</div></div></Link>
                </div>
            </div>
        }
    }
}

// 这里是董松松的修改，加了redux
function mapState(state) {
    return {
        userInfo: state.userInfo.currentUserInfo,
        isLogOn: state.userInfo.isLogOn
    }
}

function mapDispatch(dispatch) {
    return {
        logOff: () => {
            dispatch(userLogOff());
        }
    };
}

let DropDown = connect(mapState, mapDispatch)(DropDownConnect);

//到此结束

export class Search extends React.Component<{}, AppState> {     //搜索框组件

    async componentDidMount() {
        const searchBoxSelect = $('.searchBoxSelect');
        const downArrow = $('.downArrow');
        const searchBoxSub = $('.searchBoxSub');
        const searchIco = $('.searchIco');
        const searchBoxLi = searchBoxSub.find('li');

        //查看当前是全站还是某版，如果是某版就查询到某版id
        let url1 = location.href.match(/\/topic\/(\S+)\/+?/);
        let url2 = location.href.match(/\/list\/(\S+)\/+?/);
        let url3 = location.href.match(/\/(search)/);
        let boardId = 0;
        let boardName = '全站';
        if (url1) {
            let topicId = url1[1];
            let response = await Utility.getTopicInfo(topicId);
            boardId = response.boardId;
            boardName = await Utility.getBoardName(boardId);
        }
        else if (url2) {
            boardId = parseInt(url2[1]);
            boardName = await Utility.getBoardName(boardId, );
        }
        else if (url3) {
            let searchInfo = Utility.getStorage("searchInfo");
            if (searchInfo) {
                boardId = searchInfo.boardId;
                boardName = searchInfo.boardName;
            }
        }
        
        $(document).click(function () {
            searchBoxSub.css('display', 'none');
        });

        searchBoxSelect.click(function () {
            if (searchBoxSub.css('display') === 'block') searchBoxSub.css('display', 'none');
            else searchBoxSub.css('display', 'block');
            return false;   //阻止事件冒泡
        });

        downArrow.click(function () {
            if (searchBoxSub.css('display') === 'block') searchBoxSub.css('display', 'none');
            else searchBoxSub.css('display', 'block');
            return false;   //阻止事件冒泡
        });

        /*在一个对象上触发某类事件（比如单击onclick事件），如果此对象定义了此事件的处理程序，那么此事件就会调用这个处理程序，
        如果没有定义此事件处理程序或者事件返回true，那么这个事件会向这个对象的父级对象传播，从里到外，直至它被处理（父级对象所有同类事件都将被激活），
        或者它到达了对象层次的最顶层，即document对象（有些浏览器是window）。*/

        searchBoxLi.click(function () {
            searchBoxSelect.text($(this).text());
        });

        searchBoxLi.mouseover(function () {
            this.className = 'hover';
        });

        searchBoxLi.mouseout(function () {
            this.className = '';
        });
        
        //获取搜索关键词
        let self = this;
        searchIco.click(async function () {
            let val: any = $('#searchText').val();
            if (val && val != '') {
                if (searchBoxSelect.text() == '主题' || searchBoxSelect.text() == '全站') {
                    let words = val.split(' ');
                    if (words) {
                        if (words.length > 5) {
                            alert("关键词过多，请不要超过5个！");
                        }
                        else {
                            let searchInfo = { boardId: 0, boardName: '全站', words: words };
                            Utility.setStorage('searchInfo', searchInfo);
                            let host = window.location.host;
                            window.location.href = `http://${host}/search`;
                        }
                    }
                }
                else if (searchBoxSelect.text() == '版内') {
                    let words = val.split(' ');
                    if (words) {
                        if (words.length > 5) {
                            alert("关键词过多，请不要超过5个！");
                        }
                        else {
                            let searchInfo = { boardId: boardId, boardName: boardName, words: words };
                            Utility.setStorage('searchInfo', searchInfo);
                            let host = window.location.host;
                            window.location.href = `http://${host}/search`;
                        }
                    }
                }
                else if (searchBoxSelect.text() == '用户') {
                    let body = await Utility.getUserInfoByName(val);
                    let host = window.location.host;
                    if (body) {
                        window.location.href = `http://${host}/user/name/${val}`;
                    }
                    else {
                        Utility.removeStorage('searchInfo');
                        window.location.href = `http://${host}/search`;
                    }
                }
                else if (searchBoxSelect.text() == '版面') {
                    let host = window.location.host;
                    let boardResult = Utility.getBoardId(val);
                    if (boardResult) {
                        if (boardResult == []) {
                            Utility.removeStorage('searchInfo');
                            window.location.href = `http://${host}/search`;
                        }
                        else if (boardResult.length == 1) {
                            window.location.href = `http://${host}/list/${boardResult[0].id}/normal/`;
                        }
                        else if (boardResult.length > 1) {
                            Utility.setStorage("searchBoardInfo", boardResult);
                            window.location.href = `http://${host}/searchBoard`;
                        }
                        else {
                            Utility.removeStorage('searchInfo');
                            window.location.href = `http://${host}/search`;
                        }
                    }
                    else {
                        Utility.removeStorage('searchInfo');
                        window.location.href = `http://${host}/search`;
                    }
                }
            }
        });
    }

    render() {
        //查看当前是全站还是某版
        let url1 = location.href.match(/\/topic\/(\S+)\/+?/);
        let url2 = location.href.match(/\/list\/(\S+)\/+?/);
        let url3 = location.href.match(/\/(search)/);
        let flag = 1;
        if (url1) {
            console.log(url1[1]);
            flag = 0;
        }
        else if (url2) {
            console.log(url2[1]);
            flag = 0;
        }
        else if (url3) {
            let searchInfo = Utility.getStorage("searchInfo");
            if (searchInfo) {
                if (searchInfo.boardId != 0) {
                    flag = 0;
                }
            }
        }

        if (flag) {
            return <div id="search">
                <div className="box">
                    <div className="searchBoxSelect">主题</div>
                    <div className="downArrow"><img src="/images/downArrow.png" width="12" height="12" /></div>
                    <input id="searchText" type="text" placeholder="猜猜能搜到什么..." />
                    <div className="searchIco"><img src="/images/searchIco.ico" width="15" height="15" /></div>
                </div>
                <ul className="searchBoxSub">
                    <li>主题</li>
                    <li>用户</li>
                    <li>版面</li>
                </ul>
            </div>;
        }
        else {
            return <div id="search">
                <div className="box">
                    <div className="searchBoxSelect">版内</div>
                    <div className="downArrow"><img src="/images/downArrow.png" width="12" height="12" /></div>
                    <input id="searchText" type="text" placeholder="猜猜能搜到什么..." />
                    <div className="searchIco"><img src="/images/searchIco.ico" width="15" height="15" /></div>
                </div>
                <ul className="searchBoxSub">
                    <li>版内</li>
                    <li>全站</li>
                    <li>用户</li>
                    <li>版面</li>
                </ul>
            </div>;
        }
    }
}

export class Header extends React.Component<{}, AppState> {
    render() {
        return <div className="header">
            <div className="topBar">
                <div className="topBarRow">
                    <div className="row"><div style={{ margin: '10px 0 0 0' }}> <Link to="/"><img src="/images/矢量智能对象.ico" /></Link></div><div style={{ margin: '15px 0 0 5px' }}><Link to="/"><img src="/images/CC98.ico" /></Link></div></div>
                    <DropDown />
                </div>
            </div>
            <div className="headerContent">
                <div className="headerRow">
                    <div className="linkBar">
                        <div className="row" style={{ margin: '0 10px 0 10px' }}>
                            <div style={{ margin: '3px 10px 0 0' }}><img src="/images/网盘.ico" width="15" height="15" /></div>
                            <div><a href="http://share.cc98.org/" className="linkText">网盘</a></div>
                        </div>
                        <div className="row" style={{ margin: '0 10px 0 10px' }}>
                            <div style={{ margin: '3px 10px 0 0' }}><img src="/images/游戏.ico" width="15" height="15" /></div>
                            <div><a href="http://www.cc98.org/game.asp" className="linkText">游戏</a></div>
                        </div>
                        <div className="row" style={{ margin: '0 10px 0 10px' }}>
                            <div style={{ margin: '3px 10px 0 0' }}><img src="/images/勋章.ico" width="15" height="15" /></div>
                            <div><a href="http://v2.cc98.org/app/medalmanager.aspx" className="linkText">勋章</a></div>
                        </div>
                        <div className="row" style={{ margin: '0 10px 0 10px' }}>
                            <div style={{ margin: '3px 10px 0 0' }}><img src="/images/抽卡.ico" width="15" height="15" /></div>
                            <div><a href="http://card.cc98.org/" className="linkText">抽卡</a></div>
                        </div>
                        <div className="row" style={{ margin: '0 10px 0 10px' }}>
                            <div style={{ margin: '3px 10px 0 0' }}><img src="/images/gamble.ico" width="15" height="15" /></div>
                            <div><a href="http://gaming.cc98.org" className="linkText">竞猜</a></div>
                        </div>
                        <div className="row" style={{ margin: '0 10px 0 10px' }}>
                            <div style={{ margin: '3px 10px 0 0' }}><img src="/images/NexusHD.jpg" width="15" height="15" /></div>
                            <div><a href="http://www.nexushd.org" className="linkText">NexusHD</a></div>
                        </div>
                    </div>
                    <Search />
                </div>
            </div>
        </div>;

    }
}