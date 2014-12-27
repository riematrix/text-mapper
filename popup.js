/**
 * Created by Stanley Zhou on 2014/12/26.
 */
document.addEventListener("DOMContentLoaded",function(){
    document.getElementById("watch_it").addEventListener("click",function(){
        chrome.tabs.executeScript(null, {code: "watcher.approve();",allFrames: false});
    });
    document.getElementById("un_watch_it").addEventListener("click",function(){
        chrome.tabs.executeScript(null, {code: "watcher.reject();",allFrames: false});
    });
});