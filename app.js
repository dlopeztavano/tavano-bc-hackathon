const express = require('express');
const app = express()

const port = process.env.PORT || 3001;

const STRIPE_PUBLIC = "pk_test_51MAP0LLQ2msoaAhmasLqBgDb87E7cbXk61TpYqAjAbVYwHZIaWT0ipOt5XiRXHpWZa61KdmneSuUKufNUgiQFM7Z00GBBBeZn6";
const STRIPE_SECRET = "sk_test_51MAP0LLQ2msoaAhmrtJzxFfhFsxXlWdvwc3vPozR4iKU5CYwevu7T4342O7RLzRbp1ejbr8Qg07zrD5OsNxW79z900Knbye3Qu";
const STRIPE_API_URL = "https://api.stripe.com/v1/checkout/sessions";


  /**
   * @desc connect with stripe and return the session to be used in BigCommerce
   * @param {*} req 
   * @param {*} res 
   */
 async function makeStripeRequest(req,res){
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




/**
 * Adding main request to get stripe session element
 */
app.get('/', (req, res) => {        
  
  makeStripeRequest(req,res);
  
});


app.listen(port, () => {
  console.log(`Now listening on port ${port}`); 
});