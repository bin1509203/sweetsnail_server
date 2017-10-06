module.exports = function(){
    var OrientDB = require('orientjs'); // orientdb 를 제어 하기 위한 require 과 server 객체
    var server = OrientDB({
        //host: 'localhost', // 우리가 실행할 이 코드가 동작하는 nodejs와 orientdb가 같은 컴퓨터에 있으면 "localhost", 다르면 해당 "domain"
        host: '121.160.21.120',// local이 아닌 ip할당할 경우 2424번 포트포워드 설정 해줘야함!!
        port: 2424, // orientdb가 쓰는 port 번호. 일반적으로 2424임.
        username: 'root',
        password : 'ekfvkddl', // source코드에 비밀번호를 넣는것은 매우 안좋다.
        servers: [{host: '121.160.21.120', port:2424}]
    });// 마찬가지로 ip로 직접 studio 접속하려면 2480 포트포워드 해줘야함!!
    var db = server.use('webserver_v1');
    return db;
}
