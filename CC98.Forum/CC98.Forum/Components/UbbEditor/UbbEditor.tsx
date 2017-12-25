﻿// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from 'react';
import * as Utility from '../../Utility';
import { UbbContainer } from '../UbbContainer';
import LazyImage from './LazyImage';
import Message from './Message';
import Emoji from './Emoji';

/**
 * 组件属性
 */
class UbbEditorProps {
    /**
     * value变动后调用函数，接受一个参数为变动后的value
     */
    update: (value: string) => void;
    /**
     * Ubb编辑器的内容
     */
    value: string;
    /**
     * 可选选项
     */
    option?: UbbEditorOption;
}

/**
 * UBB编辑器可选选项
 */
class UbbEditorOption {
    /**
     * textarea的高度(以rem为单位)
     * 整个组件实际高度大概高2-4rem
     */
    height? = 32.5;
    /**
     * 打开的UBB标签
     */
    allowUbbTag?: 'all' | string[] = 'all'
    /**
     * 按下Ctrl+Enter调用的函数
     */
    submit?: Function;
}

/**
 * 组件状态
 */
class UbbEditorState {
    /**
    * 用户所选文字的起始位置
    */
    selectionStart: number;
    /**
    * 用户所选文字的终止位置
    */
    selectionEnd: number;
    /**
    * 用户是否是通过点击按钮离开textarea
    */
    clicked: boolean;
    /**
    * 需要额外信息的tag
    */
    extendTagName: string;
    /**
    * 额外信息的内容
    */
    extendValue: string;
    /**
     * 是否显示表情栏
     */
    emojiIsShown: boolean;
    /**
     * 表情类型
     */
    emojiType: 'em' | 'ac' | 'mj' | 'tb';
    /**
     * 是否在预览状态
     */
    isPreviewing: boolean;
    /**
     * Ubb编辑器的内容
     */
    value: string;    
    /**
     * UBB编辑器的提示信息
     */
    info: string;
}

/**
 * UBB编辑器组件
 */
export class UbbEditor extends React.Component<UbbEditorProps, UbbEditorState> {
    /**
    * 对textarea的引用
    */
    content: HTMLTextAreaElement;
    /**
    * 对input的引用
    */
    input: HTMLInputElement;
    /**
     * Ubb编辑器的历史堆栈
     */
    valueStack: string[] = ['']
    /**
     * Ubb编辑器的redo堆栈
     */
    redoStack: string[] = []
    /**
     * UBB编辑器的选项
     */
    option: UbbEditorOption;
    constructor(props) {
        super(props);
        this.state = {
            selectionEnd: 0,
            selectionStart: 0,
            clicked: false,
            extendValue: '',
            extendTagName: '',
            emojiType: 'ac',
            emojiIsShown: false,
            isPreviewing: false,
            value: '',
            info: ''
        };
        this.option = props.option || new UbbEditorOption();
        this.clearAllShown = this.clearAllShown.bind(this);
        this.handleExtendValueChange = this.handleExtendValueChange.bind(this);
        this.handleTextareaChange = this.handleTextareaChange.bind(this);
        this.handleTextareaBlur = this.handleTextareaBlur.bind(this);
        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.handleEmojiButtonClick = this.handleEmojiButtonClick.bind(this);
        this.changeEmojiType = this.changeEmojiType.bind(this);
    }

    handleExtendButtonClick(tagName: string) {
        this.setState((prevState) => ({
            extendTagName: prevState.extendTagName !== tagName ? tagName : '',
            emojiIsShown: false
        }));
    }

    handleExtendValueChange(value: string) {
        this.setState({
            extendValue: value
        });
    }

    handleTextareaChange(value: string) {
        this.valueStack.push(value);
        this.props.update(value);
        this.setState({ value });
    }

    handleTextareaBlur(start: number, end: number) {
        this.setState({
            selectionEnd: end,
            selectionStart: start
        });
    }

    async handleUpload(file: File) {
        if(this.state.extendTagName === 'upload' && file.size > 5242880){
            this.setState({
                info: '文件过大'
            });
            setTimeout(()=>this.setState({
                info: ''
            }), 2500);
            return ;
        }
        let res = await Utility.uploadFile(file);
        this.handleButtonClick(this.state.extendTagName, `${res.content}`);
    }

    handleUndo() {
        this.setState((prevState) => {
            if (this.valueStack.length === 1) {
                return { value: '' }
            }
            let prevValue = this.valueStack.pop();
            this.redoStack.push(prevValue);
            prevValue = this.valueStack[this.valueStack.length - 1];
            this.props.update(prevValue);
            return { value: prevValue };
        });
    }

    handleRedo() {
        this.setState((prevState) => {
            let prevValue: string;
            if (prevValue = this.redoStack.pop()) {
                this.valueStack.push(prevValue);
                this.props.update(prevValue);
                return { value: prevValue };
            }
        });
    }

    handleButtonClick(name: string, value = '') {
        const shouldReplaceSelection = ['video', 'audio', 'img', 'upload'].indexOf(name) !== -1;
        const hasDefaultSelection = ['url'].indexOf(name) !== -1;
        const shouldNotSelected = ['img'].indexOf(name) !== -1;
        this.setState((prevState: UbbEditorState) => {
            let before = this.state.value.slice(0, prevState.selectionStart),
                selected = this.state.value.slice(prevState.selectionStart, prevState.selectionEnd),
                after = this.state.value.slice(prevState.selectionEnd, this.state.value.length);
            if (shouldReplaceSelection) {
                selected = `[${name}]${value}[/${name}]`;
            } else if (hasDefaultSelection) {
                selected = `[${name}${value ? `=${value}` : ''}]${selected || value}[/${name}]`;
            } else {
                selected = `[${name}${value ? `=${value}` : ''}]${selected}[/${name}]`;
            }
            this.props.update(before + selected + after);
            this.valueStack.push(before + selected + after);
            return {
                selectionStart: shouldNotSelected ? before.length + selected.length : before.length,
                selectionEnd: before.length + selected.length,
                clicked: true,
                value: before + selected + after
            };
        });

    }

    handleEmojiButtonClick(emojiUbb: string) {
        this.setState((prevState) => {
            let before = this.state.value.slice(0, prevState.selectionStart),
                selected = emojiUbb,
                after = this.state.value.slice(prevState.selectionEnd, this.state.value.length);
            this.props.update(before + selected + after);
            this.valueStack.push(before + selected + after);
            return {
                selectionStart: before.length + selected.length,
                selectionEnd: before.length + selected.length,
                clicked: true,
                value: before + selected + after
            };
        });
    }

    clearAllShown() {
        this.setState({
            emojiIsShown: false,
            extendTagName: '',
            extendValue: ''
        });
    }

    changeEmojiType(emojiType: 'em' | 'ac' | 'mj' | 'tb'){
        this.setState({
            emojiType
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.valueStack[this.valueStack.length - 1] !== nextProps.value) {
            this.valueStack.push(nextProps.value);
            this.redoStack = [];
            this.setState({
                value: nextProps.value
            });
        }
    }

    componentDidUpdate() {
        if (this.state.clicked && !this.state.isPreviewing) {
            this.content.focus();
            this.content.setSelectionRange(this.state.selectionStart, this.state.selectionEnd);
            this.setState({
                clicked: false
            });
        }
    }

    componentDidMount() {
        window.addEventListener('click', this.clearAllShown);
        ($("#color") as any).spectrum({
            color: "#000",
            change: (color) => {
                this.handleButtonClick('color', color.toHexString());
                ($("#color") as any).spectrum('set', '#000000');
            },
            showPalette: true,
            palette: [
                ["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"],
                ["#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#cfe2f3", "#d9d2e9", "#ead1dc"],
                ["#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd"],
                ["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"],
                ["#c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"],
                ["#900", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"],
                ["#600", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"],
                ["#000", "#444", "#666", "#999", "#ccc", "#eee", "#f3f3f3", "#fff"]
            ],
            replacerClassName: 'ubb-color-picker',
            hideAfterPaletteSelect: true
        });
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.clearAllShown);
    }

    render() {
        const height = this.option.height;
        const size = ['', 1, 2, 3, 4, 5, 6, 7];
        
        return (
            <div className="ubb-editor" style={{ maxHeight: `${height + 6.125}rem` }}>
                <Message message={this.state.info} />
                <div className="editor-buttons">
                    <div style={{ height: '2rem', display: 'flex', transitionDuration: '.5s', overflow: 'hidden', width: this.state.isPreviewing ? '0rem' : '50rem' }}>
                        <div className="editor-buttons-styles">
                            <button className="fa-bold" type="button" title="加粗" onClick={() => { this.handleButtonClick('b'); }}></button>
                            <button className="fa-italic" type="button" title="斜体" onClick={() => { this.handleButtonClick('i'); }}></button>
                            <button className="fa-underline" type="button" title="下划线" onClick={() => { this.handleButtonClick('u'); }}></button>
                            <button className="fa-strikethrough" type="button" title="删除线" onClick={() => { this.handleButtonClick('del'); }}></button>
                            <button className="fa-align-left" type="button" title="左对齐" onClick={() => { this.handleButtonClick('align', 'left'); }}></button>
                            <button className="fa-align-center" type="button" title="居中" onClick={() => { this.handleButtonClick('align', 'center'); }}></button>
                            <button className="fa-align-right" type="button" title="右对齐" onClick={() => { this.handleButtonClick('align', 'right'); }}></button>
                            <button className="fa-eye-slash" type="button" title="回复后可见" onClick={() => { this.handleButtonClick('replyview'); }}></button>
                        </div>
                        <div className="editor-buttons-selects">
                            <p className="fa-text-height"></p>
                            <select
                                onChange={(e) => { this.handleButtonClick('size', e.target.value); (e.target.value as any) = 0; }}
                                onClick={() => { this.clearAllShown(); }}
                                value={0}
                            >
                                {size.map((value, index) => (<option value={index} disabled={index === 0} style={{ display: index === 0 ? 'none' : '' }}>{value}</option>))}
                            </select>
                            <p className="fa-eyedropper"></p>
                            <input id="color" />
                        </div>
                        <div className="editor-buttons-extends">
                            <button
                                className="fa-smile-o"
                                type="button"
                                title="插入表情"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    this.setState((prev) => ({
                                        emojiIsShown: !prev.emojiIsShown,
                                        extendTagName: '',
                                        extendValue: ''
                                    }));
                                }}
                            ></button>
                            <button className="fa-link" type="button" title="插入url" onClick={(e) => { e.stopPropagation(); this.handleExtendButtonClick('url'); }}></button>
                            <button className="fa-picture-o" type="button" title="插入图片" onClick={(e) => { e.stopPropagation(); this.handleExtendButtonClick('img'); }}></button>
                            <button className="fa-film" type="button" title="插入视频" onClick={(e) => { e.stopPropagation(); this.handleExtendButtonClick('video'); }}></button>
                            <button className="fa-music" type="button" title="插入音频" onClick={(e) => { e.stopPropagation(); this.handleExtendButtonClick('audio'); }}></button>
                            <label className="fa-file" htmlFor="upload" title="上传文件" onClick={(e) => { e.stopPropagation(); this.setState({ extendTagName: 'upload' }); }} ></label>
                        </div>
                    </div>
                    <div style={{ flexGrow: 1 }}></div>
                    <button className="fa-undo" type="button" title="撤销" onClick={() => { this.handleUndo(); }}></button>
                    <button className="fa-repeat" type="button" title="重做" onClick={() => { this.handleRedo(); }}></button>
                    <button type="button" title="切换预览" onClick={() => { this.setState((prev) => ({ isPreviewing: !prev.isPreviewing, clicked: true })); }} className="fa-window-maximize"></button>
                </div>
                <div className="ubb-extend" style={{ height: this.state.extendTagName && this.state.extendTagName !== 'upload' ? '2rem' : '0rem' }}>
                    <input
                        type="text"
                        placeholder="在此输入地址"
                        value={this.state.extendValue}
                        onChange={(e) => { this.handleExtendValueChange(e.target.value); }}
                        onClick={(e) => { e.stopPropagation(); }}
                        ref={(it) => { this.input = it; }}
                    />
                    {this.state.extendTagName === 'img' ? <label onClick={(e) => { e.stopPropagation(); }} className="fa-upload" htmlFor="upload" title="上传本地图片"></label> : null}
                    <button className="fa-check" type="button" onClick={(e) => { e.stopPropagation(); this.handleButtonClick(this.state.extendTagName, this.state.extendValue) }}></button>
                    <button className="fa-remove" type="button" onClick={() => { this.setState({ clicked: true }); }}></button>
                    <input
                        type="file"
                        id="upload"
                        accept={this.state.extendTagName === 'img' ? "image/*" : ""}
                        style={{ display: 'none' }}
                        onClick={(e) => { e.stopPropagation(); }}
                        onChange={(e) => {
                            if (e.target.files[0]) {
                                this.handleUpload(e.target.files[0]);
                                e.target.value = "";
                            }
                        }}
                    />
                </div>
                <div className="ubb-content">
                    {!this.state.isPreviewing ? (
                        <textarea
                            value={this.state.value}
                            onChange={(e) => { this.handleTextareaChange(e.target.value); }}
                            onInput={(e) => {
                                this.redoStack = [];
                            }}
                            onFocus={() => {
                                this.clearAllShown();
                            }}
                            onBlur={(e) => {
                                let target: any = e.target;
                                this.handleTextareaBlur(target.selectionStart, target.selectionEnd);
                            }}
                            onKeyDown={(e) => {
                                if (e.ctrlKey && e.key === 'z') {
                                    e.preventDefault();
                                    this.handleUndo();
                                } else if (e.ctrlKey && e.key === 'y') {
                                    e.preventDefault();
                                    this.handleRedo();
                                } else if (e.ctrlKey && e.key === 'Enter') {
                                    e.preventDefault();
                                    if (this.props.option.submit) {
                                        this.props.option.submit();
                                    }
                                }
                            }}
                            ref={(textarea) => {
                                this.content = textarea;
                            }}
                            style={{ height: this.state.extendTagName && this.state.extendTagName !== 'upload' ? `${height}rem` : `${height + 2}rem` }}
                            spellCheck={false}
                        ></textarea>) : (<div className="ubb-editor-preview" style={{ height: `${height + 2}rem` }}><UbbContainer code={this.props.value} /></div>)}
                </div>
                <Emoji 
                    handleEmojiButtonClick={this.handleEmojiButtonClick} 
                    height={this.props.option.height} 
                    emojiIsShown={this.state.emojiIsShown} 
                    emojiType={this.state.emojiType}
                    changeEmojiType={this.changeEmojiType}
                />
            </div>
        );
    }
}