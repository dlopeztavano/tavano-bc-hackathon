const express = require('express');
const app = express()
const cors = require('cors');
const fetch = require('node-fetch');

const bodyParser = require('body-parser');

app.use(bodyParser.json());

const port = 4001;

const STRIPE_PUBLIC = "pk_test_51MAP0LLQ2msoaAhmasLqBgDb87E7cbXk61TpYqAjAbVYwHZIaWT0ipOt5XiRXHpWZa61KdmneSuUKufNUgiQFM7Z00GBBBeZn6";
const STRIPE_SECRET = "sk_test_51MAP0LLQ2msoaAhmrtJzxFfhFsxXlWdvwc3vPozR4iKU5CYwevu7T4342O7RLzRbp1ejbr8Qg07zrD5OsNxW79z900Knbye3Qu";
const STRIPE_API_URL = "https://api.stripe.com/v1/checkout/sessions";

const BC_ENDPOINT = 'https://api.bigcommerce.com/stores/ieopxvzl9a/v3/';
const BC_X_AUTH_TOKEN = "1cu5yh64whtm35j1yihzobmz0yarhar";


async function getProduct(productId){
  
  var product ;
  let url = BC_ENDPOINT + "catalog/products/" + productId;

  let options = {
      method: 'get',
      headers: {'accept': "application/json",'Content-Type': 'application/json', 'X-Auth-Token': BC_X_AUTH_TOKEN},
    };
    
    await fetch(url, options)
      .then(res => {
        product = res.json(); 
        return res.json()
      })
      .then(json => console.log(json))
      .catch(err => console.error('error:' + err));

      return product
}

async function getStripeCheckoutSession(product,qty){

  var checkout_session ;

  await stripe.checkout.sessions.create({
    success_url: 'https://example.com/success',
    line_items: [
      {price: 'price_1Mr7CWLQ2msoaAhm1C2C0hRY', quantity: qty},
    ],
    mode: 'payment',
  }).then((body) => {
    
    checkout_session = body;

  })

  return checkout_session

}

async function buildStripeSession(req,res){

  var productId = req.query.productId;

  var qty = req.query.qty || 1;

  if (productId){

    // var product = await getProduct(productId);
    var product;

    // res.status(200).json(product);
    
    var stripe_checkout_session = await getStripeCheckoutSession(product,qty);

    res.status(200).json(stripe_checkout_session);

    


  }else{

    res.status(200).json({"error":"no product specified"})  

  }

}



  /**
   * @desc connect with stripe and return the session to be used in BigCommerce
   * @param {*} req 
   * @param {*} res 
   */
 async function makeStripeRequest(req,res){

  var productId = req.query.productId;
  
  if(productId){
    var product = await getProduct(productId)
    console.log("product 2")
    console.log(JSON.stringify(product))
    res.status(200).json(JSON.stringify(product))  
  }
  
  return
  var product = await getProduct()

  res.status(200).json(product)

  
  
  fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error('error:' + err));




  console.log("1")
  session = await stripe.checkout.sessions.create({
    success_url: 'https://example.com/success',
    line_items: [
      {price: 'price_1MAP1qLQ2msoaAhmNZ0U2CO6', quantity: 2},
    ],
    mode: 'payment',
  });
  console.log("session")
  console.log(JSON.stringify(session))
  res.status(200).json(session)
}

const stripe = require('stripe')(STRIPE_SECRET);

function priceToCents(price) {
  if (price) {
      var p = JSON.parse(price);
      return p * 100;
  }
  return 0;
}


app.use(cors({
  origin: 'http://localhost:3000'
}));

/**
 * Adding main request to get stripe session element
 */
app.get('/', (req, res) => {    
  
  buildStripeSession(req,res)
  
});


/********************************* BigCommerce Middleware  ***************************/


app.post('/createPickupOptions', (req, res) => {  
  
  
  console.log('create pickup options endpoint');

  let url = `${BC_ENDPOINT}pickup/options`


  let options = {
      method: 'post',
      headers: {
        'accept': "application/json",
        'Content-Type': 'application/json',
        'X-Auth-Token': BC_X_AUTH_TOKEN
      },
      body: JSON.stringify(req.body)
    };
  
    async function createPickupOptions() {
      
      const response = await fetch(url, options);
      const responseText = await response.text();
      console.log(responseText);

      res.status(200).json(responseText);

    }

    createPickupOptions(req, res);
  
});


/********************************* BigCommerce Middleware  ***************************/



app.listen(port, () => {
  console.log(`Now listening on port ${port}`); 
});