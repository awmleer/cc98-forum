﻿// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from 'react';
import {
    Route
} from 'react-router-dom';

import * as Utility from '../../Utility';

import { UserCenterExact } from './UserCenterExact';
import { UserCenterMyFollowings } from './UserCenterMyFollowings';
import { UserCenterMyFans } from './UserCenterMyFans';
import { UserCenterMyPostsExact } from './UserCenterMyPostsExact';
import { UserCenterMyFavorites } from './UserCenterMyFavorites'; 
import { UserCenterConfig } from './UserCenterConfig';

/**
 * 用户中心主体
 */
export class UserCenterRouter extends React.Component {
    render() {
        let logOnState = Utility.isLogOn();
        if (!Utility.isLogOn()) {
            return <div className="user-center-router">请先登录</div>;
        }

        return (<div className="user-center-router">
            <Route exact path="/usercenter/" component={UserCenterExact} />
            <Route path="/usercenter/myfollowings/:page?" component={UserCenterMyFollowings} />
            <Route path="/usercenter/myfans/:page?" component={UserCenterMyFans} />
            <Route path="/usercenter/myposts/:page?" component={UserCenterMyPostsExact} />
            <Route path="/usercenter/myfavorites" component={UserCenterMyFavorites} />
            <Route path="/usercenter/config" component={UserCenterConfig} />
        </div>);
    }
}