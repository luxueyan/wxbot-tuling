const _ = require('lodash')

const listCompile = _.template(
  `<% _.forEach(list, function(item) { %>
    <%- item.name %>：<%- item.info %>\r
    <%- item.detailurl %>
  <%}); %>
`)

exports.createTextMsg = function(res) {
  res.data.content = res.data.text
  if (res.data.url) {
    if (res.data.url.startsWith('http://m.image.so.com')) {
      res.data.url = res.data.url.replace('http://m.image.so.com/i?q', 'http://pic.sogou.com/pics?query')
    }
    res.data.content = `${res.data.text || '😰，这个问题难住我了'}${res.data.url || ''}`
  } else if (res.data.list) {
    res.data.content = listCompile(res.data)
  }
}

