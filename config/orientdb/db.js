module.exports = function(){
    var OrientDB = require('orientjs'); // orientdb 를 제어 하기 위한 require 과 server 객체
    var server = OrientDB({
        host: 'localhost', // 우리가 실행할 이 코드가 동작하는 nodejs와 orientdb가 같은 컴퓨터에 있으면 "localhost", 다르면 해당 "domain"
        port: 2424, // orientdb가 쓰는 port 번호. 일반적으로 2424임.
        username: 'root',
        password : '********' // source코드에 비밀번호를 넣는것은 매우 안좋다.
    });
    var db = server.use('webserver_v1');
    return db;
}
