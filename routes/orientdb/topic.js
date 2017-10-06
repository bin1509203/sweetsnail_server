module.exports = function(){
    var route = require('express').Router();
    var db = require('../../config/orientdb/db')();

    ////////////   글추가
    route.get('/add', function(req,res){
        var sql = 'SELECT FROM topic';
        db.query(sql).then(function(topics){
            res.render('topic/add', {topics:topics, user:req.user});
        });
    }); 
    route.post('/add', function(req,res){
        var title = req.body.title;
        var description = req.body.description;
        var author = req.body.author;
        var sql = 'INSERT INTO topic (title, description, author) VALUES(:title, :desc, :author)';
        db.query(sql, {
            params:{
                title: title,
                desc: description,
                author: author
            }
        }).then(function(results){
            res.redirect('/'+encodeURIComponent(results[0]['@rid']));
        })
    });

    ////////// 글 편집

    route.get('/:id/edit', function(req,res){
        console.log('edit_get1 : '+id+'req.id'+req.params.id);
        var sql = 'SELECT FROM topic';
        var id = req.params.id;
        console.log('edit_get2 : '+id+'req.id'+req.params.id);
        db.query(sql).then(function(topics){
            var sql = 'SELECT FROM topic WHERE @rid=:rid';
            db.query(sql, {params:{rid:id}}).then(function(topic){
                console.log('edit_get3 : '+id+'req.id'+req.params.id);
                res.render('topic/edit', {topics:topics, topic:topic[0], user:req.user});
            });
        });
    }); 
    route.post('/:id/edit', function(req,res){
        console.log('edit_post1 : '+id+'req.id'+req.params.id);
        var sql = 'UPDATE topic SET title=:t, description=:d, author=:a WHERE @rid=:rid';
        var id = req.params.id;
        var title = req.body.title;
        var desc = req.body.description;
        var author = req.body.author;
        console.log('edit_post2 : '+id+'req.id'+req.params.id);
        db.query(sql, {
            params:{
                t:title,
                d:desc,
                a:author,
                rid:id
            }
        }).then(function(topics){ // update이므로 topics 에는 몇개가 update되었는지 저장되어있음
            res.redirect('/'+encodeURIComponent(id)); // 위와 다르게 id로!
        });
    }); 

    /////////  글삭제

    route.get('/:id/delete', function(req,res){
        var sql = 'SELECT FROM topic';
        var id = req.params.id;
        db.query(sql).then(function(topics){
            var sql = 'SELECT FROM topic WHERE @rid=:rid';
            db.query(sql, {params:{rid:id}}).then(function(topic){
                res.render('topic/delete', {topics:topics, topic:topic[0], user:req.user});
            });
        });
    }); 
    route.post('/:id/delete', function(req,res){
        var sql = 'DELETE FROM topic WHERE @rid=:rid';
        var id = req.params.id;
        db.query(sql, {
            params:{
                rid:id
            }
        }).then(function(topics){ 
            res.redirect('/'); 
        });
    }); 

    //////// 글 목록 만들기 : 폴더 내에 저장되어 있는 파일을 불러옴
    // topic/xxxx 형태는 모두 topic/:id 에 걸리므로 아래 코드는 가장 
    // 하단부에 위치하여야 한다. 그렇지 않으면 topic/add 이런것도 다 
    // 아래코드로 실행되버림.

    route.get(['', '/:id'], function(req,res){
        var sql = 'SELECT From topic';
        db.query(sql).then(function(topics){ // topics에 모든 목록 저장
            var id = req.params.id;
            if(id){ // 해당 id 값에 해당하는 목록 하나만 topic에 저장 [ '/:id' ]
                var sql = 'SELECT FROM topic WHERE @rid=:rid';
                db.query(sql, {params:{rid:id}}).then(function(topic){
                    res.render('topic/view', {topics:topics, topic:topic[0], user:req.user});
                });
            }else{ // 목록이 아닌 main topic 으로 접근하는 경우 [ '' ]
                res.render('topic/view', {topics:topics, user:req.user}); // session에 저장된 user정보 가져오기.
                console.log(req.user);
            }
        });

    });

    return route;
}
