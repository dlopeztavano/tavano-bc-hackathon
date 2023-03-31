import React, { Component, useState, useEffect } from 'react';
import axios from "axios";
import { Panel, Text, Badge, GlobalStyles } from '@bigcommerce/big-design';
import stripe from './stripe.jpg'

export default function PickupOptions({ line }) {

    const [options, setOptions] = useState([]);
    const [optionSelected, setOption] = useState('');

    useEffect(() => {

        var bodyRequest = {
            search_area: {
                coordinates: {
                    latitude: line.lat,
                    longitude: line.lng
                },
                radius: {
                    value: 40,
                    unit: "KM"
                }
            },
            items: [
                {
                    variant_id: line.variantId,
                    quantity: line.quantity
                }
            ]
        };

        const url = 'https://basic-node-server.onrender.com';
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        //API request
        axios
        .post(url+"/createPickupOptions", JSON.stringify(bodyRequest), {headers})
        .then((response) => setOptions(response.data))
        .catch(err => console.log(err));

      
    }, []);

    function handleOptionSelection(option) {

        const locationId = option.pickup_method.location_id;
       
        jQuery.ajax({url: `${'https://basic-node-server.onrender.com?productId='+line.productId+'&quantity='+line.quantity+'&locationId='+locationId}`, success: function(result){
            location.href = result.url
        }});
    }

    return (<>
        {/* <img src={stripe} alt="logo"/>  */}
        <div className="options">
            {options.map((option) => (
                <div className="option" key={option.pickup_method.id}>
                    <Panel
                        action={{
                            variant: 'secondary',
                            text: 'Pick up here',
                            onClick: (event) => {
                                event.preventDefault();
                                handleOptionSelection(option);
                              }
                        }}
                        header={option.pickup_method.display_name} 
                    >
                        <Badge label="stripe " variant="primary" />
                        <Text>
                            {option.pickup_method.collection_instructions}
                        </Text>
                    </Panel>
                </div>
            ))}
        </div>
    </>);

}

