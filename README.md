# Fast Checkout: BOPIS & Stripe

## Stack of APIS and tecnologies:

- BOPIS API
- GraphQL API
- Management API
- Stripe API
- BigDesign
- Stencil 

### Diagram "BOPIS.png"

![BOPIS.png](https://github.com/dlopeztavano/tavano-bc-hackathon/blob/feature/front_end_store/BOPIS.png)


## Run the theme locally:

Clone the repository

```bash
git clone git@github.com:dlopeztavano/tavano-bc-hackathon.git
```

Move to the branch feature/front_end_store

```bash
git checkout feature/front_end_store
```

Install node v12.18.3 on Windows or 16.10.0 on Mac (same as in node server explained below)

```bash
Install node v12.18.3
```

Install Stencil CLI

```bash
npm install -g @bigcommerce/stencil-cli
```

Initialize the theme

```bash
stencil init url: https://store-ieopxvzl9a.mybigcommerce.com/ token: s1gz30pmqpl22c7m2lc2xkezqyirelv
```
Install node modules

```bash
npm install
```

Run the theme locally

```bash
stencil start
```


## Run the server:

Clone the repository

```bash
git clone git@github.com:dlopeztavano/tavano-bc-hackathon.git
```

Move to the feature/node_server

```bash
git checkout feature/node_server
```

Install node v12.18.3 on Windows or 16.10.0 on Mac

```bash
install node v12.18.3
```

install dependencies

```bash
npm install
```

Run the server locally 

```bash
node app.js
```




### Why did you build this?
- We saw an opportunity to get more customers placing orders when they want to buy just a single item that they like/need and do not have time to register. These customers might also want to save some money if the shipping is not free or if they have a nearby location and need the product really quick, so they will choose the preferred location to pick it up.
- Most importantly because it was fun, challenging and we were going to learn a lot (and we did! )

### What obstacles did you face in building this?
- Incompatibility node.js libraries with M1 MacBook OS:
  - Stripe webhooks
  - Node Saas
- Get variant id by using Stencil API function utils.api.productAttributes.optionChange in the constructor of the product details script
- GraphQL Storefront API did not return inventory per location

### Who are your ideal users?
- Guest Shoppers

### What problem did you solve?
- Long process to make a single purchase:
  - Fast checkouts are more attractive to guest shoppers
- Pick up in store:
  - Having suggested locations nearby encourage shoppers to pick the items up
  - It's a win-win > shoppers get quicker their items and business does not spend money on shipping
    
### What might you do with some extra time? Which features would you add?
- Save Customer's information
  - So next purchase could be done without submitting their credit card
- Display Inventory per location
- Add link to google maps to see distance from my current location to the inventory location
- Better structure on the BigCommerce Middleware (app.js)
  - Controller
  - Facade to handle requests
- Independent Checkout feature of the BOPIS API to add it to Orders to be shipped as well
