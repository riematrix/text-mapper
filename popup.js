/**
 * Created by Stanley Zhou on 2014/12/26.
 */
document.addEventListener("DOMContentLoaded",function(){
    document.getElementById("watch_it").addEventListener("click",function(){
        chrome.tabs.executeScript(null, {code: "addToWatch();",allFrames: false});
    });
    document.getElementById("un_watch_it").addEventListener("click",function(){
        chrome.tabs.executeScript(null, {code: "removeFromWatch();",allFrames: false});
    });
});