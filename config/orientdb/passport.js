module.exports = function(app){
    // app 인자를 사용하기때문에 함수 인자로 받아와야 사용가능.
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy; // local(단순히 id+pw) 인증시스템 위한 모듈
    var FacebookStrategy = require('passport-facebook').Strategy; // 타사 인증시스템 위한 모듈
    var bkfd2Password = require("pbkdf2-password"); // npm install --save pbkdf2-password
    var hasher = bkfd2Password();
    var db = require('./db')(); // db 설정은 따로 db.js 파일로 처리. 함수 호출() 하여 리턴값 db를 변수db에 저장

    app.use(passport.initialize());
    app.use(passport.session()); // 17번째 줄의 session 설정 코드가 나온 이후에 이 코드가 있어야함!

    passport.serializeUser(function(user, done) { 
        // LocalStrategy 설정에서 done의 두번째 인자로 false가 아닌 경우 그 인자가 이 callback함수의 첫번째 인자로전달   
            console.log('serializeUser', user);
            done(null, user.authId); // user.authId이 session에 저장됨. 여기서 두번째 인자는 식별자로 유일해야함.
        });
    passport.deserializeUser(function(id, done) { 
    // 일단 한번 login 되어있으면 그 이후로는 deserializerUser 콜백함수 실행됨. user.username이 첫번째 인자로 들어옴.
    // 로그인 상태에서 새로고침하면 계속 deserializeUser 호출됨. 이때 'id'인자는 위에서 저장된 session 내의 authId를 받아옴.
        console.log('deserializeUser', id);
        var sql = 'SELECT FROM user WHERE authId=:authId';
        db.query(sql, {params:{authId:id}}).then(function(results){
            if(results.length === 0){
                done('There is no user.');
            }else{
                done(null, results[0]);
            }
        })
    });
        
    passport.use(new LocalStrategy(
        function(username, password, done){ // 첫번째 인자와 두번째 인자로 기존 사용자가 맞는지 확인하는 과정나옴.
            var uname = username;
            var pwd = password; // 사용자가 입력한 비밀번호
            var sql = 'SELECT * FROM user WHERE authId=:authId';
            db.query(sql, {params:{authId:'local:'+uname}}).then(function(results){
                if(results.length === 0){ // results의 결과가 없다면, 즉 그런 사용자가 없다면
                    return done(null, false);
                }
                var user = results[0];
                return hasher({password:pwd, salt:user.salt}, function(err, pass ,salt, hash){// pbkdf2 암호화 기법 이용
                    if(hash === user.password){ // 로그인 위해 입력한 암호를 hash한 값과 db에 저장된 hash된 암호가 같니?
                        console.log('LocalStrategy', user);
                        done(null, user); // 얘 실행되면 serializeUser의 callback 함수가 실행되는것이 약속되어있다.
                    }else{ // id는 맞는데 pw(해쉬)가 틀린경우
                        done(null, false);
                    }
                });
                console.log(results);
            })
        }
    ));// local에 대한 정의
        
    passport.use(new FacebookStrategy(
        {
            clientID: '************', // facebook app의 'APP ID' https://developers.facebook.com/apps/2013625822254589/dashboard/
            clientSecret: '*************', // facebook_app_secret code : 절때 공개하면 안된다.
            callbackURL: "/auth/facebook/callback",
            profileFields: ['id', 'email', 'gender', 'link', 'locale',
            'name', 'timezone', 'updated_time', 'verified', 'displayName']// 사용자 허가받아 추가로 가져올 정보 기술
        },
        function(accessToken, refreshToken, profile, done) { // profile과 done 이 중요!!
            console.log(profile); // profile이 어떤 정보를 가지고 있는지 확인!
            var authId = 'facebook:'+profile.id; // facebook을 통해 가입한 사용자 확인을 위한 id값 부여
            var sql = 'SELECT FROM user WHERE authId=:authId';
            db.query(sql, {params:{authId:authId}}).then(function(results){
                if(results.length === 0){ // 페북 로그인이 처음이라면
                    var newuser = {
                        'authId':authId, // 'authId' 나 authId 나 둘다 상관은 없음.
                        'displayName':profile.displayName,
                        'email':profile.emails[0].value
                    };
                    var sql = 'INSERT INTO user (authId, displayName, email) VALUES(:authId, :displayName, :email)';
                    db.query(sql, {params:newuser}).then(function(){
                        done(null, newuser);
                    }, function(error){
                        console.log(error);
                        done('Error');
                    });
                }else{ // 존재하는 페북 로그인 사용자라면
                    return done(null, results[0]);
                }
            });
        }
    ));// facebook에 대한 정의

    return passport;
}
