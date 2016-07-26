'use strict';

//引入依赖
const express = require('express');
const cheerio = require('cheerio');
const superagent = require('superagent');
const escaper = require('true-html-escape');
const app = express();

const removeHTMLTag = function (str) {
    str = str.replace(/<\/?[^>]*>/g, '');
    return str;
};

app.get('/', function (req, res) {
    res.status(200).json({ msg: 'hello nodejs' })
});


app.get('/*', function (req, res, next) {
    let competition = {
        'china': '?competition=51',
        'chinasub': '?competition=148',
        'english': '?competition=8',
        'dermany': '?competition=9',
        'spain': '?competition=7',
        'italy': '?competition=13'
    };
    let key = req.params['0'];
    let team = key.split('/')[1];
    let type = key.split('/')[0];
    let _type = (type==='mvp')?'goal_rank':(type==='rank')?'team_rank':(type==='attack')?'assist_rank':'';
    console.info(`http://www.dongqiudi.com/data${competition[team]}&type=${_type}`);
    superagent.get(`http://www.dongqiudi.com/data${competition[team]}&type=${_type}`)
        .set('Content-Type', 'application/json')
        .end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            let $ = cheerio.load(sres.text);
            let items = [];
            console.log(type);
            switch (type){
                case 'rank':
                    $('#stat_detail tr .team').each(function (index, element) {
                        var $element = $(element);
                        items.push({
                            team: escaper.unescape(removeHTMLTag($element.html())),
                            img: $element.find('img').attr('src'),
                            rank:index
                        });
                    });
                    break;
                case 'mvp':
                    $('#stat_detail tr').each(function (index, element) {
                        var $element = $(element);
                        items.push({
                            team: escaper.unescape(removeHTMLTag($element.find('.team').html())),
                            rank: escaper.unescape(removeHTMLTag($element.find('.rank').html())),
                            mvp: escaper.unescape(removeHTMLTag($element.find('.player').html())),
                            stat: escaper.unescape(removeHTMLTag($element.find('.stat').html())),
                            img: $element.find('img').attr('src')
                        });
                    });
                    break;
                case 'attack':
                    $('#stat_detail tr').each(function (index, element) {
                        var $element = $(element);
                        items.push({
                            team: escaper.unescape(removeHTMLTag($element.find('.team').html())),
                            rank: escaper.unescape(removeHTMLTag($element.find('.rank').html())),
                            mvp: escaper.unescape(removeHTMLTag($element.find('.player').html())),
                            stat: escaper.unescape(removeHTMLTag($element.find('.stat').html())),
                            img: $element.find('img').attr('src')
                        });
                    });
                    break;
                default:
                    console.error('一个神奇的错误');
            }

            items.splice(0, 1);
            if (items.toString()!==''){
                res.status(200).json({ code: 200,data:items })
            }else {
                res.status(200).json({ error: '没有数据' })
            }
        });
});



app.listen(80, function (req, res) {
    console.log('app is running at port 3000');
});