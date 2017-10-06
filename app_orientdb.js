var app= require('./config/orientdb/express')();

///////////////////////// app_passport_orientdb.js 와 합치기

var passport = require('./config/orientdb/passport')(app); // passport도 하나의 파일로 처리
var auth = require('./routes/orientdb/auth')(passport); // auth.js 내용 불러오기 [ /auth 들어간 코드를 auth.js 파일로 분리 ]
// auth.js 내의 module.exports function을 호출하기 위해 빈 ( ) 를 준것. 호출되면 리턴값 'route'를 받아 'auth' 변수에 저장
app.use('/auth', auth); // 이 앱으로 들어오는 모든 요청 중에 /auth 로 시작하는 요청이 들어오면
// auth 변수가 가지고 있는 'route' 리턴값에게 위임한다.

////////////////////////

var topic = require('./routes/orientdb/topic')();
//app.use('/topic', topic);
app.use('', topic); // sweetsnail.iptime.org 로 바로 접근하기 위해 수정.

app.listen(80, function(req,res){
    console.log('Connected, 80 port!');
});
