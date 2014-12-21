/**
 * simple text map tool as chrome extension
     Copyright (C) 2014  Stanley Zhou

     This program is free software; you can redistribute it and/or modify
     it under the terms of the GNU General Public License as published by
     the Free Software Foundation; either version 2 of the License, or
     (at your option) any later version.

     This program is distributed in the hope that it will be useful,
     but WITHOUT ANY WARRANTY; without even the implied warranty of
     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     GNU General Public License for more details.

     You should have received a copy of the GNU General Public License along
     with this program; if not, write to the Free Software Foundation, Inc.,
     51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 * Created by Stanley Zhou on 2014/9/4.
 */
chrome.contextMenus.create({
    title: 'Persistent information',
    contexts: ['page'],
    onclick: function (evt,tab) {
        //chrome.tabs.create({ url: evt.pageUrl })
        var info = evt.selectionText;
        if(info){}// instant information
        else{} // serializable information
        /*chrome.runtime.sendMessage({method: 'collect_persistent_info'}, function(response) {
            //clickLinkWithText(name);
        });*/
        executeTabFunction(tab.id,"collectPersistentInfo",[info]);
    }
});

chrome.contextMenus.create({
    title: 'Temporary information',
    contexts: ['selection'],
    onclick: function (evt, tab) {
        var info = evt.selectionText;
        if(info){}
        else{}

        executeTabFunction(tab.id,"collectTemporaryInfo",[info]);
    }
});

chrome.contextMenus.create({
    title: 'Run this snippet',
    contexts: ['selection'],
    onclick: function (evt, tab) {
        var info = evt.selectionText;
        if(info){}
        else{}
        executeTabFunction(tab.id,"openwin",[info]);
    }
});

function executeTabFunction(tabId, functionName, params){
    chrome.tabs.executeScript(tabId,{
        code: functionName + "('" + params.join("','") + "')"
    });
}