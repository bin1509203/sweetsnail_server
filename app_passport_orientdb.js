// localhost:2480 => schema => 'user' class 생성 
// => new property : authId(mandatory+not null), username, password, salt, displayName(mandatory+not null) : 다 string type
// => new index : authId 를 UNIQUE 한 값으로 설정 : INDEXING 되어 빠르게 검색 & id가 중복 허용x 효과

var app = require('./config/orientdb/express')();

////////// passport 는 위 require 파일 내부의 session 다음에 와야한다.
var passport = require('./config/orientdb/passport')(app); // passport도 하나의 파일로 처리

var auth = require('./routes/orientdb/auth')(passport); // auth.js 내용 불러오기 [ /auth 들어간 코드를 auth.js 파일로 분리 ]
// auth.js 내의 module.exports function을 호출하기 위해 빈 ( ) 를 준것. 호출되면 리턴값 'route'를 받아 'auth' 변수에 저장
app.use('/auth', auth); // 이 앱으로 들어오는 모든 요청 중에 /auth 로 시작하는 요청이 들어오면
// auth 변수가 가지고 있는 'route' 리턴값에게 위임한다.

app.listen(80, function(){
    console.log('Connected 80 port!!!');
});
