const fs = require('fs')
const path = require('path')

const base = path.join(__dirname, '../../')

const dirs = fs.readdirSync(base)
const result = dirs.filter(dir => {
  dir = dir.toLocaleLowerCase()
  return !dir.endsWith('.md') && !dir.startsWith('.')
}).map(dir => {
  const items = fs.readdirSync(`${base}/${dir}`)
  return {
    title: dir,
    items: items.map(item => item.replace(/\.md$/g, ''))
  }
})

module.exports = result