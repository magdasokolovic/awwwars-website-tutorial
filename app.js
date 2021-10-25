require('dotenv').config()
const express = require('express')
const errorHandler = require('errorhandler')
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
app.use(errorHandler())

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
    'pages/home'
    // ,{
    //   meta: {
    //     data: {
    //       title: 'Floema',
    //       description: 'Meta data description'
    //     }
    //   }
    // }
  )
})

app.get('/about', async (req, res) => {
  const api = await initApi(req)
  const about = await api.getSingle('about')
  // const meta = await api.getSingle('meta')
  res.render('pages/about', {
    // meta,
    about
  })
})

app.get('/collections', async (req, res) => {
  const api = await initApi(req)
  // const meta = await api.getSingle('meta')
  const { results: collections } = await api.query(
    Prismic.Predicates.at('document.type', 'collection'), {
      fetchLinks: 'products.image'
    })
  console.log(collections)
  res.render('pages/collections', {
    collections
  })
})

app.get('/detail/:uid', async (req, res) => {
  const api = await initApi(req)
  // const meta = await api.getSingle('meta')
  const product = await api.getByUID('product', req.params.uid, {
    fetchLinks: 'collection.title'
  })
  console.log(product)

  res.render('pages/detail', {
    product
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
