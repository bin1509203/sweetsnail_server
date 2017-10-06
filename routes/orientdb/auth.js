module.exports = function(passport){ // 외부에 선언된 passport 변수를 가져옴.

    var route = require('express').Router(); // app.get, app.post 를 전부 route.get, route.post 로 바꾸기
    var bkfd2Password = require("pbkdf2-password"); // npm install --save pbkdf2-password
    var hasher = bkfd2Password();
    var db = require('../../config/orientdb/db')(); // db 설정은 따로 db.js 파일로 처리
    // ./ : 상위폴더 ../ : 부모폴더, auth.js 는 nodejs 폴더가 아닌 nodejs/routes/orientdb 에 있다.
    // 따라서 auth.js 가 있는 위치[orientdb]에서 부모의[routes] 부모의[nodejs] 형제의[nodejs 내의 모든폴더]

    ////////// log-in 기능 구현하기 
    // 직접 hard coding한 html code를 jade로 간소화하기. http://html2jade.org/
    route.get('/login', function(req, res){
        var sql = 'SELECT From topic';
        db.query(sql).then(function(topics){
        // 이미 /auth 로 시작하는 경우 이 auth.js를 불러오기때문에 /auth/login 대신에 /login만 써야함.
            res.render('auth/login', {topics:topics}); // jade 파일로 html hard code를 분산
        });
    });

    route.post('/login', // 이미 /auth 로 시작하는 경우 이 auth.js를 불러오기때문에 /auth/login 대신에 /login만 써야함.
        passport.authenticate('local', // 첫번째 인자 : 'strategy'[페북인증처럼 타사인증인지 id.pw인증(loacal)인지 ]
            { 
                successRedirect: '/', // login 성공한 경우 이동할 page
                failureRedirect: '/auth/login', // login 실패한 경우 이동할 page
                failureFlash: false  // done의 세번째 인자로 메세지 전달과 관련. 
            }
        )
    );
    
    route.get('/facebook',
        passport.authenticate('facebook', // 두번째 인자는 사용자의 허가를 받아야 사용할 수 있는 옵션 : https://developers.facebook.com/docs/facebook-login/permissions
            {
                scope:'email'
            }
        )
    );
    route.get('/facebook/callback',
        passport.authenticate('facebook', 
            { 
                successRedirect: '/',
                failureRedirect: '/auth/login' 
            }
        )
    );
    
    ////////////  logout 기능 구현
    
    route.get('/logout', function(req, res){
        req.logout();
        // delete req.session.displayName;
        req.session.save(function(){ // save 되기전에 redirect 가 먼저 실행되는것을 방지.
            res.redirect('/');
        });
    });
    
    /////////////  회원가입 기능 구현
    
    route.get('/register', function(req, res){
        var sql = 'SELECT From topic';
        db.query(sql).then(function(topics){
        // 이미 /auth 로 시작하는 경우 이 auth.js를 불러오기때문에 /auth/login 대신에 /login만 써야함.
            res.render('auth/register', {topics:topics}); // jade 파일로 html hard code를 분산
        });
    });
    
    ////// 회원 등록 구현 과정 + 암호화
    route.post('/register', function(req, res){
        hasher({password:req.body.password}, function(err, pass, salt, hash){
            var user = {
                authId:'local:'+req.body.username,
                username: req.body.username,
                password: hash,
                salt: salt,
                displayName: req.body.displayName
            };
            var sql = 'INSERT INTO user (authId, username, password, salt, displayName) VALUES(:authId, :username, :password, :salt, :displayName)';
            db.query(sql, { // class 'user' 으로 INSERT
                params:user
            }).then(function(results){ // then 첫번째 인자 = 성공, 두번째 인자 = 실패
                    req.login(user, function(err){ // 가입 후 즉시 로그인
                        req.session.save(function(){
                            res.redirect('/');
                        });
                    });
            }, function(error){
                console.log(error);
                res.status(500);
            });
            // users.push(user); db insert로 대체
        });   
    });
    return route; // route들을 리턴한다.
};
