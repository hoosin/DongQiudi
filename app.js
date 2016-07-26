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

app.get('/rank/*', function (req, res, next) {
    let competition = {
        'china':'',
        'english':'?competition=8',
        'dermany':'?competition=9',
        'spain':'?competition=7'
    };
    let key = req.params['0'];
    superagent.get(`http://www.dongqiudi.com/data${competition[key]}`)
        .set('Content-Type', 'application/json')
        .end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            var $ = cheerio.load(sres.text);
            var items = [];
            $('#stat_detail .team').each(function (index, element) {
                var $element = $(element);
                items.push({
                    title: escaper.unescape(removeHTMLTag($element.html())),
                    img: $element.find('img').attr('src'),
                    rank: index
                });
            });
            items.splice(0, 1);
            res.send(items);
        });
});


app.listen(3000, function (req, res) {
    console.log('app is running at port 3000');
});