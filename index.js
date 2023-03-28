const express = require('express'); //Import the express dependency
const app = express();              //Instantiate an express app, the main work horse of this server
const port = 8000;                  //Save the port number where your server will be listening
const fetch = require('node-fetch');



app.post('/webhook', express.json({type: 'application/json'}), (request, response) => {
  const event = request.body;

  // Handle the event
  switch (event.type) {
    case '"payment_intent.created"':
        const paymentCreated = event.data.object;
        
        break;
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
});


//Idiomatic expression in express to route and respond to a client request
app.get('/', (req, res) => {        //get requests to the root ("/") will route here
    placeOrder()
    res.send('Hello World!')
                                                        //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile 
});

app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    
    
    console.log(`Now listening on port ${port}`); 
});


function placeOrder(){

    let url = "https://api.bigcommerce.com/stores/ieopxvzl9a/v2/orders"

    let options = {
        method: 'post',
        headers: {'accept': "application/json",'Content-Type': 'application/json', 'X-Auth-Token': '1cu5yh64whtm35j1yihzobmz0yarhar'},
        body: '{"billing_address":{"first_name":"Jane","last_name":"Doe","street_1":"123 Main Street","city":"Austin","state":"Texas","zip":"78751","country":"United States","country_iso2":"US","email":"janedoe@email.com"},"products":[{"name":"BigCommerce Coffee Mug","quantity":1,"price_inc_tax":50,"price_ex_tax":45}]}'
      };
      
      fetch(url, options)
        .then(res => res.json())
        .then(json => console.log(json))
        .catch(err => console.error('error:' + err));
    


}