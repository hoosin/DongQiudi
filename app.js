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

app.get('/*', function (req, res, next) {
    let competition = {
        'china': '',
        'chinasub': '?competition=148',
        'english': '?competition=8',
        'dermany': '?competition=9',
        'spain': '?competition=7',
        'italy': '?competition=13'
    };
    let key = req.params['0'];
    let team = key.split('/')[1];
    let type = key.split('/')[0];
    console.log(`http://www.dongqiudi.com/data${competition[team]}&type=${type === 'mvp' ? 'goal_rank' : 'team_rank'}`)
    superagent.get(`http://www.dongqiudi.com/data${competition[team]}&type=${type === 'mvp' ? 'goal_rank' : 'team_rank'}`)
        .set('Content-Type', 'application/json')
        .end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            var $ = cheerio.load(sres.text);
            var items = [];
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
            items.splice(0, 1);
            res.send(items);
        });
});


app.listen(3000, function (req, res) {
    console.log('app is running at port 3000');
});