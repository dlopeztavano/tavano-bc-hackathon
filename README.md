Fast Checkout: BOPIS & Stripe

Stack of APIS and tecnologies:

- BOPIS API
- GraphQL API
- Management API
- Stripe API
- BigDesign
- Stencil 

Please the diagram "BOPIS.png"


Run the theme locally:

1- Clone the repo git@github.com:dlopeztavano/tavano-bc-hackathon.git
2- git checkout feature/front_end_store
3- Install node v12.18.3
4- Install Stencil CLI npm install -g @bigcommerce/stencil-cli
5- Initialize the theme stencil init url: https://store-ieopxvzl9a.mybigcommerce.com/ token: s1gz30pmqpl22c7m2lc2xkezqyirelv
6- Install node modules npm install
7- Run stencil start


Run the server:

1- Clone the repository git clone git@github.com:dlopeztavano/tavano-bc-hackathon.git
2- Move to the feature/node_server
3- git checkout feature/node_server
4- Use node.js 16.10.0 and install dependencies
5- npm install
6- Run the project locally node app.js


Why did you build this?
    We saw an opportunity to get more customers placing orders when they want to buy just a single item that they like/need and do not have time to register. These customers might also want to save some money if the shipping is not free or if they have a nearby location and need the product really quick, so they will choose the preferred location to pick it up.
    Most importantly because it was fun, challenging and we were going to learn a lot (and we did! )

What obstacles did you face in building this?
    Incompatibility node.js libraries with M1 MacBook OS
    Stripe webhooks
    Node Saas
    Get variant id by using Stencil API function utils.api.productAttributes.optionChange in the constructor of the product details script
    GraphQL Storefront API did not return inventory per location

Who are your ideal users?
    Guest Shoppers

What problem did you solve?
    Long process to make a single purchase
    Fast checkouts are more attractive to guest shoppers
    Pick up in store
    Having suggested locations nearby encourage shoppers to pick the items up
    It's a win-win > shoppers get quicker their items and business does not spend money on shipping
    
What might you do with some extra time? Which features would you add?
    Display Inventory per location
    Add link to google maps to see distance from my current location to the inventory location
    Better structure on the BigCommerce Middleware (app.js)
    Controller
    Facade to handle requests