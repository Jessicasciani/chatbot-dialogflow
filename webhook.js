'use strict';

const Restify = require("restify");
const server = Restify.createServer({
  name: "Finance Dialogflow"
});

const request = require('request');
const PORT = process.env.PORT || 8000;

server.use(Restify.plugins.bodyParser());
server.use(Restify.plugins.jsonp());

const checkBalance = (cb) => {

  return request({
      url: 'https://api.monzo.com/balance?account_id=acc_00009SirF4bQ87veK7AiDB',
      method: 'GET',
      json: true,
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJlYiI6ImJZakErQmJURXRyREFrNXJYVEMvIiwianRpIjoiYWNjdG9rXzAwMDA5aHZJUXlEalBLYlFTMFZuTloiLCJ0eXAiOiJhdCIsInYiOiI1In0.DySQ3nhijo21_VkflLfhlYLlAHC27yuuN8wUYcFJPJUfGoQaw9FwYjZtub5x09iWYSs_QBYIf4xxiL-Pc5D3kQ',
      }
    }, (error, response, body) => {
        if(!error && response.statusCode === 200) {
          let data = response.body
          let balance = (data.balance);
          let str = `💸 Your balance is £${balance/100}`;
          cb(null, str);
        } else {
          cb(error, null);
        }
    });
  }

// This is the one not working

  const lastTransactions = (cb) => {

  return request({
      url: 'https://api.monzo.com//transactions?expand[]=merchant&account_id=acc_00009SirF4bQ87veK7AiDB',
      method: 'GET',
      json: true,
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJlYiI6ImJZakErQmJURXRyREFrNXJYVEMvIiwianRpIjoiYWNjdG9rXzAwMDA5aHZJUXlEalBLYlFTMFZuTloiLCJ0eXAiOiJhdCIsInYiOiI1In0.DySQ3nhijo21_VkflLfhlYLlAHC27yuuN8wUYcFJPJUfGoQaw9FwYjZtub5x09iWYSs_QBYIf4xxiL-Pc5D3kQ',
      }
    }, (error, response, body) => {
        if(!error && response.statusCode === 200) {
          let data = response.body
          // let str = "test"

          // I left the above as a test, not working, but the response is supposed to be (not working either):

          let transact = data.transactions.slice(Math.max(data.transactions.length - 5, 0));

          let fiveTransactions = []
          transact.map(function(transaction) {
              if (transaction.amount < 0 && transaction.merchant === null) {
                fiveTransactions.push(`💸 £${Math.abs(transaction.amount/100)} at ${transaction.description}`);
              } else if (transaction.amount < 0) {
                fiveTransactions.push(`${transaction.merchant.emoji} £${Math.abs(transaction.amount/100)} at ${transaction.description}`);
              }
          });
          let str = `Activity during the past 7 days: \n\n ${fiveTransactions.join().split(',').join("\n\n")}`
          console.log(str);

          cb(null, str);
        } else {
          cb(error, null);
        }
    });
  }


  const spentToday = (cb) => {
    let str = "You have spent some amount of money today"
    cb(null,str)
  }


  const spentWeek = (cb) => {
    let str = "You have spent some amount of money this week"
    cb(null,str)
  }

  const merchantPeriod = (cb) => {
    let str = "You have targeted the merchant for how much this week"
    cb(null,str)
  }


server.post('/', (req, res, next) => {

  let {
    queryResult
  } = req.body;

  console.log(queryResult);

  if(queryResult) {

    if(queryResult.action === "checkBalance" ) {
      checkBalance((error, result) => {
        if(!error && result) {
          let respObj = {
            fulfillmentText: result
          }
          res.json(respObj);
        }
      });

    } else if (queryResult.action === "lastTransactions") {
        lastTransactions((error, result) => {
          console.log(result);
          if(!error && result) {
            let respObj = {
              fulfillmentText: result
            }
            console.log(result);
            res.json(respObj);
          }
        });

      } else if (queryResult.action === "spentToday") {
        spentToday((error, result) => {
        if(!error && result) {
          let respObj = {
            fulfillmentText: result
          }
          res.json(respObj);
        }
      });

    } else if (queryResult.action === "merchantPeriod") {
        merchantPeriod((error, result) => {
        if(!error && result) {
          let respObj = {
            fulfillmentText: result
          }
          res.json(respObj);
        }
      });
    }
  }


  return next();

});

server.listen(PORT, () => console.log(`Running on ${PORT}`));
