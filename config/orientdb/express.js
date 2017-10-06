module.exports = function(){
    var express = require('express');
    var session = require('express-session');
    var OrientoStore = require('connect-oriento')(session); // session을 db로 저장하기 위한 모듈 load
    // 이 모듈은 독립적으로 동작하지 못하고, express-session 과 함께 동작시켜야 함. 따라서 인자로 session 전달
    var bodyParser = require('body-parser'); // for app.post
    
    var app = express();
    app.set('views', './views/orientdb');
    app.set('view engine', 'jade');
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(session({
        secret: 'DSFJI#@!$LSDF&%#$', // session id 값 쿠키 랜덤값이랑 같게 넣어도됌.
        resave: false, 
        saveUninitialized: true,
        store: new OrientoStore({ // session 을 orient db로 저장하기 위한 설정. db에 'Session' 이라는 class 생성됨
            server: 'host=localhost&port=2424&username=root&password=********&db=webserver_v1'
        })
    }));

    return app;
}
