# JsBridge.js
web与App交互规则封装

e.g

``` javascript
const JSB = new JsBridge();

//调用客户端暴露的方法
JSB.exec('appMethod', {
    a: 1,
    b: 2
}, function() {
    console.log('Execute App Method');
})


//定义能被客户端调用的方法
JSB.addEventListener('jsMethod', function() {
    console.log('Execute Web-JS Method')
})
```
