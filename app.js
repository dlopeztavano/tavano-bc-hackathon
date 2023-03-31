const express = require('express');
const app = express()
const cors = require('cors');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());


const port = 4001;

const STRIPE_PUBLIC = "pk_test_51MAP0LLQ2msoaAhmasLqBgDb87E7cbXk61TpYqAjAbVYwHZIaWT0ipOt5XiRXHpWZa61KdmneSuUKufNUgiQFM7Z00GBBBeZn6";
const STRIPE_SECRET = "sk_test_51MAP0LLQ2msoaAhmrtJzxFfhFsxXlWdvwc3vPozR4iKU5CYwevu7T4342O7RLzRbp1ejbr8Qg07zrD5OsNxW79z900Knbye3Qu";
const STRIPE_API_URL = "https://api.stripe.com/v1/checkout/sessions";

const BC_ENDPOINT = 'https://api.bigcommerce.com/stores/ieopxvzl9a/v3/';
const BC_ENDPOINT_V2 = 'https://api.bigcommerce.com/stores/ieopxvzl9a/v2/';
const BC_X_AUTH_TOKEN = "1cu5yh64whtm35j1yihzobmz0yarhar";

const stripe = require('stripe')(STRIPE_SECRET);


async function getLocationByIdFromBc(locationId){

  var location ;
  let url = BC_ENDPOINT + "inventory/locations?location_id:in="+locationId ;

  let options = {
      method: 'get',
      headers: {'accept': "application/json",'Content-Type': 'application/json', 'X-Auth-Token': BC_X_AUTH_TOKEN},
    };
    
    await fetch(url, options)
      .then(res => {
        
        location = res.json(); 
        return res.json()
        
      })
      .then(json => console.log(json))
      .catch(err => console.error('error:' + err));

      return location

}

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

  console.log("flag1");

  var locationId = parseInt(checkout_session_completed.metadata.locationId || 2);

  var customerId = checkout_session_completed.metadata.customerId || 107 ;

  var variantId = 65;

  var productId = 81;

  var fullCheckoutSession = await getFullCheckoutSessionDataFromStripe(checkout_session_completed.id);

  

  
  console.log("flag2");

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

  
  var billing_address;

  if (checkout_session_completed && checkout_session_completed.customer_details ){

    billing_address = {
      "first_name":checkout_session_completed.customer_details.name || checkout_session_completed.customer_details.email,
      "last_name":checkout_session_completed.customer_details.name || checkout_session_completed.customer_details.email,
      "street_1":checkout_session_completed.customer_details.line1 || " ",
      "city":checkout_session_completed.customer_details.address.city || " ",
      "state":checkout_session_completed.customer_details.address.state|| " ",
      "zip":checkout_session_completed.customer_details.address.postal_code || " ",
      "country": "United States",
      "country_iso2":"US",
      "email":checkout_session_completed.customer_details.email|| "mlugli@tavanoteam.com",
  }

  }else
  {
    billing_address = defaultBillingAddress
  }
  
  console.log("flag3");
  

  var consignments = {

    pickups: [
      {
        "pickup_method_id": locationId,
        "pickup_method_display_name": "Pick Up",
        "collection_instructions": "Bring your ID",
        "collection_time_description": "9am - 6pm",
        "location": {
          "name": "Location 1 - override",
          "code": "LOCATION-1 - override",
          "address_line_1": "123 Main Street - override",
          "address_line_2": "Suite 101 - override",
          "city": "Austin - override",
          "state": "Texas - override",
          "postal_code": "78726 - override",
          "country_alpha2": "US",
          "email": "location1@example.com",
          "phone": "+1 111-111-1111 - override"
        },
        "line_items": []
      }
    ]
  }

  // Retrieving location Data from the backend
  var locationObject = await getLocationByIdFromBc(locationId);

  console.log("flag4");
  console.log("locationObject");
  console.log(JSON.stringify(locationObject));

  if (locationObject && locationObject.data && locationObject.data.length > 0 ){

    

    consignments.pickups[0].location.name = locationObject.data[0].label;
    consignments.pickups[0].location.address_line_1 = locationObject.data[0].address.address1;
    consignments.pickups[0].location.address_line_2 = locationObject.data[0].address.address2;
    consignments.pickups[0].location.city = locationObject.data[0].address.city;
    consignments.pickups[0].location.state = locationObject.data[0].address.state;
    consignments.pickups[0].location.postal_code = locationObject.data[0].address.zip;
    consignments.pickups[0].location.phone = locationObject.data[0].address.phone;
    consignments.pickups[0].location.code = locationObject.data[0].code;



  }
  

  // --------------------
  // retrieve products
  // --------------------
  
  for (var i = 0 ; i < fullCheckoutSession.line_items.data.length; i++){

    consignments.pickups[0].line_items.push({
      product_id:productId,
      variant_id:variantId,
      // name:fullCheckoutSession.line_items.data[i].description,
      quantity: fullCheckoutSession.line_items.data[i].quantity,
      // price_inc_tax: fullCheckoutSession.line_items.data[i].price.unit_amount,
      // price_ex_tax: fullCheckoutSession.line_items.data[i].price.unit_amount,
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


  console.log("bcOrderBody");
  console.log(JSON.stringify(bcOrderBody));

  // fetch(BC_ENDPOINT_V2 + "orders",options).then(res=>res.json()).catch(err=>console.log("error:" + err))
  var orderInBc = await fetch(BC_ENDPOINT_V2 + "orders", options)
        .then(res => res.json())
        .then(json => console.log(json))
        .catch(err => console.error('error:' + err));

  console.log("orderInBc");
  console.log(JSON.stringify(orderInBc))
    
  
}

async function getFullPaymentIntent(payment_intent){

  var paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);

  return paymentIntent

}


async function getFullCheckoutSessionDataFromStripe(id){

  var checkout_session ;

  await stripe.checkout.sessions.retrieve(
    id,{
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
      {price: 'price_1MrnK0LQ2msoaAhmqlUmdn0s', quantity: qty},
    ],
    // customer:"cus_NcMG1OPnXtziQs",
    mode: 'payment',
    metadata:{
      "locationId":locationId,
      "customerId":customerId,
      "productId":productId
    },
    billing_address_collection:"required"

  }).then((body) => {
    
    checkout_session = body;

  })

  return checkout_session

}

async function buildStripeSession(req,res){

  var productId = req.query.productId || 81;
  var qty = req.query.qty || 1;
  var locationId = req.query.locationId || 2;
  var customerId = req.query.customerId || 107;


  locationId = parseInt(locationId);

  if (productId){

    var product;

    var stripe_checkout_session = await getStripeCheckoutSession(productId,qty,locationId,customerId);

    res.status(200).json(stripe_checkout_session);

  }else{

    res.status(200).json({"error":"no product specified"})  

  }

}





app.use(cors({
  
  origin: ["http://localhost:3000","https://sinbi-store.mybigcommerce.com"]
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
  response.json({received_v2: true});
});


/********************************* BigCommerce Middleware  ***************************/


app.post('/createPickupOptions', (req, res) => {  
  
  
  console.log('create pickup options endpoint');

  let url = `${BC_ENDPOINT}pickup/options`

  console.log(JSON.stringify(req.body));

  let options = {
      method: 'post',
      headers: {
        'accept': "application/json",
        'Content-Type': 'application/json',
        'X-Auth-Token': BC_X_AUTH_TOKEN
      },
      body: JSON.stringify(req.body)
    };
  
    async function createPickupOptions(req, res) {
      
      const response = await fetch(url, options);

      let responseText = await response.text();
      let responseObject = JSON.parse(responseText);

      res.setHeader('Content-Type', 'application/json');

      if(responseObject && responseObject.results && (responseObject.results.length > 0) && responseObject.results[0].pickup_options){
        console.log('There are results & pickup_options');
        //res.end(JSON.stringify(responseObject.results[0].pickup_options));
        res.status(200).json(responseObject.results[0].pickup_options);
      }else{
        //res.end(responseText);
        res.status(200).json(responseText);
      }
    }

    createPickupOptions(req, res);
  
});


/********************************* BigCommerce Middleware  ***************************/


app.listen(port, () => {
  console.log(`Now listening on port ${port}`); 
});






