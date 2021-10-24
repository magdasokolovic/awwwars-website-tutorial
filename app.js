require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
const port = 3000

const Prismic = require('@prismicio/client')
const PrismicDOM = require('prismic-dom')

const initApi = (req) => {
  return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req
  })
}

const handleLinkResolver = () => {
  // Define the url depending on the document type
  // if (doc.type === 'page') {
  //   return '/page/' + doc.uid;
  // } else if (doc.type === 'blog_post') {
  //   return '/blog/' + doc.uid;
  // }

  // Default to homepage
  return '/'
}

// Middleware to inject prismic context
app.use((req, res, next) => {
  res.locals.ctx = {
    endpoint: process.env.PRISMIC_ENDPOINT,
    linkResolver: handleLinkResolver
  }
  // add PrismicDOM in locals to access them in templates.
  res.locals.PrismicDOM = PrismicDOM
  next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render(
    'pages/home',
    {
      meta: {
        data: {
          title: 'Floema',
          description: 'Meta data description'
        }
      }
    }
  )
})

app.get('/about', (req, res) => {
  initApi(req).then(api => {
    api.query(
      Prismic.Predicates.any('document.type', ['about', 'meta'])).then(response => {
      // response is the response object. Render your views here.
      const { results } = response
      const [about, meta] = results
      console.log(about, meta)
      res.render('pages/about', {
        about, meta
      })
    })
  })
})

app.get('/collections', (req, res) => {
  res.render('pages/collections')
})

app.get('/detail/:id', (req, res) => {
  res.render('pages/detail')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
