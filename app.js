'use strict'

//依赖
const express = require('express')
const cheerio = require('cheerio')
const superagent = require('superagent')
const escaper = require('true-html-escape')
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
    'french':16,
    'uefa':10 //欧冠
  }

  //目标数据页面ID
  let htmlHook = {
    'rank': '#stat_detail tr .team',
    'mvp': '#stat_detail tr',
    'attack': '#stat_detail tr'
  }

  let key = req.params['0']
  let team = key.split('/')[1]
  let type = key.split('/')[0]
  let _type = (type === 'mvp') ? 'goal_rank' :
    (type === 'rank') ? 'team_rank' :
      (type === 'attack') ? 'assist_rank' : ''

  console.info(`http://www.dongqiudi.com/data?competition=${competition[team]}&type=${_type}`)
  superagent.get(`http://www.dongqiudi.com/data?competition=${competition[team]}&type=${_type}`)
    .set('Content-Type', 'application/json')
    .end((err, sres) => {
      // 常规的错误处理
      if (err) return next(err)
      let $ = cheerio.load(sres.text)
      let items = []
      console.log(type)

      let crawler = (elm) => {
        return new Promise((resolve, reject) => {
          if (elm) {
            $(elm).each((index, element) => {
              let elm = $(element)
              switch (type) {
                case 'rank':
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
          res.status(200).json({code: 200, data: data})
        } else {
          res.status(200).json({error: '没有数据'})
        }
      }).catch((err) => {
        console.log(err)
      })
    })
})


app.listen(10000, (req, res) => {
  console.log('app is running at port 10000')
})
