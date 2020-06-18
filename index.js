#!/usr/bin/env node

/****************************

This was an afternoon project I wrote to help my 7-yr-old learn TensorFlow.js

Why? Gathering up training images is a pain. With this CLI command, you can gather
thousands of training images in a minute, organized into folders by keyword.

Just install globally and then, from inside any directory invoke like:

 > ts-images "dog, cat, mouse, rat"

A `ts-images` dir will be created with sub-directories `dog`, `cat` etc.
Each sub-directory will contain hundreds of keyword images.

**************************/

const axios = require('axios')
const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')
const path = require('path')
const fs = require('fs')
const md5 = require('md5')
const inquirer = require('inquirer')
const Scraper = require('images-scraper')
const cwd = process.cwd()
const args = process.argv
const MAX_PER_KW = 1000

var images_dir = '' //makeNewImagesDir()
var total_image_count = 0

// suppress unwanted messages from other modules
console.info=(()=>{})

/******************************/
init()
/******************************/

async function init() {
  clear()
  console.log(
    chalk.green.bold.italic(
      figlet.textSync('TF-Images', { horizontalLayout: 'full', font: 'Fire Font-s' })
    )
  )
  console.log(chalk.gray.bold(`\nTensorFlow training needs lots of keyword images. This little tool fetches tons of images from Google image search and drops then into keyword-named folders as a starting point. Make sure to browse the folers and remove inappropriate images before starting your ML training.`))

  // get keywords from arguments or request from command prompt
  let keywords = getKeywords()
  if (!keywords || keywords.length<1) {
    let kw = await promptForKeywords()
    keywords = getKeywords(kw.kw)
  }
  console.log('')


  if (keywords.length>0) {
    images_dir = makeNewImagesDir()
    getKeywordImages(keywords).then(() => {
      console.log(
        chalk.green(`🥳 ${total_image_count} images downloaded to: `),
        chalk.green.bold('/' + images_dir.split('/').slice(-2).join('/'), ` 🥳 🥳 🥳 \n\n\n`)
      )
      process.exit()
    })
  } else {
    console.error('Sorry, cannot fetch keyword images without some keywords!')
    process.exit()
  }
}



async function promptForKeywords() {
  console.log()
  return inquirer.prompt([{
    message: "Comma-delimited list of keywords (or phrases): ",
    name: "kw"    /* Pass your questions in here */
  }])
}



function getKeywords(kw) {
  if (!kw) kw = args.slice(2)[0] || ''
  return kw.trim().split(',')
           .map(kw => kw.trim().toLowerCase()).filter(kw=>kw)
           .filter((kw,i,ls) => ls.indexOf(kw)===i)
}


async function getKeywordImages(kwlist) {
  // return new Promise((resolve, reject) => {
    let allRequests = []
    for (const kw of kwlist) {
    // kwlist.forEach((kw) => {
      let targetDir = `${images_dir}/${kw.replace(/ /g, '-')}`
      fs.mkdirSync(targetDir)
      // console.log.clearLine(); console.log.cursorTo(0)
      console.log(chalk.gray.bold('\n🤖 Searching Google for images by keyword: "'+kw+'"'))
      const scraper = new Scraper({
        userAgent: 'Mozilla/5.0 (X11; Linux i686; rv:64.0) Gecko/20100101 Firefox/64.0',
        puppeteer: { headless: true, },
        tbs: {  // every possible tbs search option, some examples and more info: http://jwebnet.net/advancedgooglesearch.html
          isz: "m", // options: l(arge), m(edium), i(cons), etc.
          itp:  "photo",// options: clipart, face, lineart, news, photo
          ic:   "color",// options: color, gray, trans
          sur:  ""// options: fmc (commercial reuse with modification), fc (commercial reuse), fm (noncommercial reuse with modification), f (noncommercial reuse)
        },
      })
      let results = await scraper.scrape(kw, MAX_PER_KW)
      if (results) results.forEach( ({url}) => {
        let ext = path.extname(url).split('?')[0].toLowerCase()
        if (['.jpg','.jpeg','.png'].indexOf(ext)>-1) {
          let out = `${targetDir}/${md5(url)}${path.extname(url).split('?')[0]}`
          let method = "get", responseType = "stream"
          allRequests.push( axios({method, url, responseType}).then( (res, err) => {
            res.data.pipe(fs.createWriteStream(out))
            total_image_count++
           }).catch((err)=>{  })
          )
        }
      })
      else console.log('No scraper results...')
      // console.log(requests)
    }
    // done gathering requests
    // console.log.clearLine(); console.log.cursorTo(0)
    console.log(chalk.gray.bold('\n👍 Downloading '+ allRequests.length +' images...\n'))
    return Promise.all(allRequests)
  // })
}

function makeNewImagesDir() {
  let target = `${cwd}/tf-images`
  let iterator = 1
  while (directoryExists(target)) target = `${cwd}/tf-images_${iterator++}`
  fs.mkdirSync(target)
  return target
}




function directoryExists(filePath){
  return fs.existsSync(filePath)
}