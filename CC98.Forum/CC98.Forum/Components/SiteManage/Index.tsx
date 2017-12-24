﻿import * as React from 'react';
import * as Utility from '../../Utility';
import { UbbContainer } from '../UbbContainer';
import Announcement from './Announcement';
import Ad from './Advertisement';



export class SiteManage extends React.Component {    
    render() {
        return (<div style={{backgroundColor: 'white'}}>
            <p>全站管理</p>
            <Announcement />
            <Ad />
        </div>);
    }
}