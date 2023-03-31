const express = require('express');
const app = express()
const cors = require('cors');
const fetch = require('node-fetch');

const port = 4001;

const STRIPE_PUBLIC = "pk_test_51MAP0LLQ2msoaAhmasLqBgDb87E7cbXk61TpYqAjAbVYwHZIaWT0ipOt5XiRXHpWZa61KdmneSuUKufNUgiQFM7Z00GBBBeZn6";
const STRIPE_SECRET = "sk_test_51MAP0LLQ2msoaAhmrtJzxFfhFsxXlWdvwc3vPozR4iKU5CYwevu7T4342O7RLzRbp1ejbr8Qg07zrD5OsNxW79z900Knbye3Qu";
const STRIPE_API_URL = "https://api.stripe.com/v1/checkout/sessions";

const BC_ENDPOINT = 'https://api.bigcommerce.com/stores/ieopxvzl9a/v3/';
const BC_ENDPOINT_V2 = 'https://api.bigcommerce.com/stores/ieopxvzl9a/v2/';
const BC_X_AUTH_TOKEN = "1cu5yh64whtm35j1yihzobmz0yarhar";

const stripe = require('stripe')(STRIPE_SECRET);

async function createStripeCustomer(){
  
  var customer ;

  await stripe.customers.create({
    description: 'My First Test Customer (created for API docs at https://www.stripe.com/docs/api)',
  }).then((body) => {
    
    customer = body;

  })

  return customer

}

async function buildOrderInBc(checkout_session_completed)
{

  var locationId = checkout_session_completed.metadata.locationId || 1;

  var customerId = checkout_session_completed.metadata.customerId;

  var fullCheckoutSession = await getFullCheckoutSessionDataFromStripe();

  // var fullPaymentIntent = await getFullPaymentIntent(fullCheckoutSession.payment_intent);


  // Building some default billing just for local hooks triggers
  var defaultBillingAddress = {
    "first_name":"Jane",
    "last_name":"Doe",
    "street_1":"123 Main Street",
    "city":"Austin",
    "state":"Texas",
    "zip":"78751",
    "country":"United States",
    "country_iso2":"US",
    "email":"janedoe@email.com"
  }

  
  console.log("checkout_session_completed.customer_details")
  console.log(checkout_session_completed.customer_details)

  var billing_address;

  if (checkout_session_completed && checkout_session_completed.customer_details && false){

    billing_address = {
      "first_name":checkout_session_completed.customer_details.name,
      "last_name":checkout_session_completed.customer_details.name,
      "street_1":checkout_session_completed.customer_details.line1,
      "city":checkout_session_completed.customer_details.address.city,
      "state":checkout_session_completed.customer_details.address.state,
      "zip":checkout_session_completed.customer_details.address.postal_code,
      "country":checkout_session_completed.customer_details.address.country,
      "country_iso2":checkout_session_completed.customer_details.address.country,
      "email":checkout_session_completed.customer_details.email,
  }

  }else
  {
    billing_address = defaultBillingAddress
  }
  
  

  var consignments = {

    pickups: [
      {
        "pickup_method_id": locationId,
        "pickup_method_display_name": "Pick Up - override",
        "collection_instructions": "Bring your ID - override",
        "collection_time_description": "9am - 6pm - override",
        "location": {
          "name": "Location 1 - override",
          "code": "LOCATION-1 - override",
          "address_line_1": "123 Main Street - override",
          "address_line_2": "Suite 101 - override",
          "city": "Austin - override",
          "state": "Texas - override",
          "postal_code": "78726 - override",
          "country_alpha2": "US",
          "email": "location1@example.com - override",
          "phone": "+1 111-111-1111 - override"
        },
        "line_items": []
      }
    ]
  }
  

  // --------------------
  // retrieve products
  // --------------------
  
  for (var i = 0 ; i < fullCheckoutSession.line_items.data.length; i++){

    consignments.pickups[0].line_items.push({
      name:fullCheckoutSession.line_items.data[i].description,
      quantity: fullCheckoutSession.line_items.data[i].quantity,
      price_inc_tax: fullCheckoutSession.line_items.data[i].price.unit_amount,
      price_ex_tax: fullCheckoutSession.line_items.data[i].price.unit_amount,
    })
  }


  var bcOrderBody = {
    billing_address : billing_address,
    consignments :consignments
  } 


  // -----------------------------
  // Adding customer id (if exists)
  // -----------------------------
  if (customerId)
  {
    bcOrderBody["customer_id"] = customerId
  }


  var options = {
    method: 'post',
    headers: {'accept': "application/json",'Content-Type': 'application/json', 'X-Auth-Token': BC_X_AUTH_TOKEN},
    body:JSON.stringify(bcOrderBody)
  }

  // fetch(BC_ENDPOINT_V2 + "orders",options).then(res=>res.json()).catch(err=>console.log("error:" + err))
  fetch(BC_ENDPOINT_V2 + "orders", options)
        .then(res => res.json())
        .then(json => console.log(json))
        .catch(err => console.error('error:' + err));
    
  
}

async function getFullPaymentIntent(payment_intent){

  var paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);

  return paymentIntent

}


async function getFullCheckoutSessionDataFromStripe(){

  var checkout_session ;

  await stripe.checkout.sessions.retrieve(
    'cs_test_a1ja4qCTTXqk3Ta8vnnziyJvVsf3wF6WtqbDcbXgAMOCi3YezpnzY0tXJH',{
      expand:["line_items"]
    }).then((body) => {
    
    checkout_session = body;

  })

  return checkout_session

}



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

async function getStripeCheckoutSession(productId,qty,locationId,customerId){

  var checkout_session ;

  await stripe.checkout.sessions.create({
    success_url: 'https://example.com/success',
    line_items: [
      {price: 'price_1MrVWcLQ2msoaAhmGSx1XnJ2', quantity: qty},
    ],
    customer:"cus_NcMG1OPnXtziQs",
    mode: 'payment',
    metadata:{
      "locationId":locationId,
      "customerId":customerId
    },
    billing_address_collection:"required"

  }).then((body) => {
    
    checkout_session = body;

  })

  return checkout_session

}

async function buildStripeSession(req,res){

  var productId = req.query.productId;
  var qty = req.query.qty || 1;
  var locationId = req.query.locationId;
  var customerId = req.query.customerId;

  if (productId){

    var product;

    var stripe_checkout_session = await getStripeCheckoutSession(productId,qty,locationId,customerId);

    res.status(200).json(stripe_checkout_session);

  }else{

    res.status(200).json({"error":"no product specified"})  

  }

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

app.post('/stripe_webhooks', express.json({type: 'application/json'}), (request, response) => {
  const event = request.body;

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const checkout_session_completed = event.data.object;
      
      
      buildOrderInBc(checkout_session_completed)

      
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
});


app.listen(port, () => {
  console.log(`Now listening on port ${port}`); 
});






