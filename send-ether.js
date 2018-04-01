var ethers = require('ethers');
var bluebird = require('bluebird');

/**
  *function for ether transaction, send ether from private Key to "to" from
  *@param {String} privateKey - private Key of from address
  *@param {String} to  - to ethereum address
  *@param {String} amount - amount in eth
  *@param {String} network - network would be testnet or mainnet
  *@return {Object} - returns the txHash of transaction
  */  

module.exports = function(privateKey,to,amount,network){

    return new bluebird.Promise(function(resolve,reject){

        if(privateKey.substr(0,2) !== '0x'){
            privateKey = '0x'+privateKey; 
        }

        var wallet = new ethers.Wallet(privateKey);
        var providers = ethers.providers;
        var utils = ethers.utils;
        var provider;
    

        if(network === 'testnet'){
            provider = new providers.InfuraProvider(providers.networks.ropsten);
            wallet.provider = ethers.providers.getDefaultProvider('ropsten');
        }

        else{
            provider = new providers.InfuraProvider(providers.networks.mainnet);
            wallet.provider = ethers.providers.getDefaultProvider();
        }

         var transaction = {
            gasLimit: 21000,
            to: to,
            value: utils.parseEther(amount.toString())
        };

        wallet.getTransactionCount()
        .then(function(walletNonce){
            transaction.nonce = walletNonce;
           
            return wallet.estimateGas(transaction);
        })
        .then(function(gasPrice){
            
            transaction.gasPrice = gasPrice;
            var signedTransaction = wallet.sign(transaction);

            return provider.sendTransaction(signedTransaction);

        })
        .then(function(hash){

            resolve(hash);
        })
        .catch(function(err){
            var responseText = JSON.parse(err.responseText);
            var error = responseText["error"];
            var message = error["message"];
            reject(message);
        });

    });
}