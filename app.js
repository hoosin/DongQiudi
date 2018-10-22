'use strict'

//依赖
const express = require('express') // 著名的 nodejs 框架
const cheerio = require('cheerio') // 为服务器特别定制的，快速、灵活、实施的 jQuery 核心实现.
const superagent = require('superagent') // nodejs 里一个非常方便的客户端请求代理模块
const escaper = require('true-html-escape') // Unicode
const app = express()

const removeHTMLTag = (str) => {
  str = str.replace(/<\/?[^>]*>/g, '')
  return str
}

app.get('/', (req, res) => {
  res.sendfile('./doc.html')
})

app.get('/*', (req, res, next) => {

  //目标数据 competition 的值
  let competition = {
    'china': 51,
    'chinasub': 148,
    'english': 8,
    'dermany': 9,
    'spain': 7,
    'italy': 13,
    'french': 16,
    'uefa': 10 //欧冠
  }

  //目标数据页面ID
  let htmlHook = {
    'rank': '#stat_detail tr .team',
    'mvp': '#stat_detail tr',
    'attack': '#stat_detail tr'
  }

  let key = req.params['0']
  console.log(key)
  let team = key.split('/')[1]
  let type = key.split('/')[0]
  let _type = (type === 'mvp') ? 'goal_rank' :
    (type === 'rank') ? 'team_rank' :
      (type === 'attack') ? 'assist_rank' : ''

  superagent.get(`http://www.dongqiudi.com/data?competition=${competition[team]}&type=${_type}`)
    .set('Content-Type', 'application/json')
    .end((err, _res) => {
      // 常规的错误处理
      if (err) return next(err)
      let $ = cheerio.load(_res.text)

      // const cheerio = require('cheerio');
      // const $ = cheerio.load('<h2 class="title">Hello world</h2>');
      // $('h2.title').text('Hello there!');
      // $('h2').addClass('welcome');
      // $.html();
      //=> <h2 class="title welcome">Hello there!</h2>


      let items = []
      let crawler = (elm) => {
        return new Promise((resolve, reject) => {
          if (elm) {
            $(elm).each((index, element) => {
              let elm = $(element)
              switch (type) {
                case 'rank':
                  // const escaper = require("true-html-escape");
                  // escaper.escape("¤¥€");                                                  ///<= &curren;&yen;&euro; 
                  // escaper.unescape("&lt;span&gt;&#29579;&#23612;&#29595;&lt;/span&gt;");  ///<= <span>王尼玛</span> 
                  // escaper.unescape("&#12501;&#12521;&#12531;&#12489;&#12540;&#12523;");   ///<= フランドール 
                  // escaper.unescape("(&#x256d;&#xffe3;3&#xffe3;)&#x256d;&#x2661;")         ///<= (╭￣3￣)╭♡ 
                  items.push({
                    team: escaper.unescape(removeHTMLTag(elm.html())),
                    img: elm.find('img').attr('src'),
                    rank: index
                  })
                  break
                case 'mvp':
                  items.push({
                    team: escaper.unescape(removeHTMLTag(elm.find('.team').html())),
                    rank: escaper.unescape(removeHTMLTag(elm.find('.rank').html())),
                    mvp: escaper.unescape(removeHTMLTag(elm.find('.player').html())),
                    stat: escaper.unescape(removeHTMLTag(elm.find('.stat').html())),
                    img: elm.find('img').attr('src')
                  })
                  break
                case 'attack':
                  items.push({
                    team: escaper.unescape(removeHTMLTag(elm.find('.team').html())),
                    rank: escaper.unescape(removeHTMLTag(elm.find('.rank').html())),
                    mvp: escaper.unescape(removeHTMLTag(elm.find('.player').html())),
                    stat: escaper.unescape(removeHTMLTag(elm.find('.stat').html())),
                    img: elm.find('img').attr('src')
                  })
                  break
                default:
                  console.error('一个神奇的错误')
              }
              resolve(items)
            })
          } else {
            reject('ERR MSG')
          }
        })
      }

      crawler(htmlHook[type]).then((data) => {
        data.splice(0, 1)
        if (data.toString() !== '') {
          res.status(200).json({ code: 200, data: data })
        } else {
          res.status(200).json({ error: '没有数据' })
        }
      }).catch((err) => {
        console.log(err)
      })
    })
})


app.listen(8080, (req, res) => {
  console.log('app is running at port 8080')
})
