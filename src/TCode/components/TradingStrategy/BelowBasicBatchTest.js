/* eslint-disable */
import { rebase } from "./utils";

const _ = require("lodash");

export default function BelowBasicBatchTest(dataIn,maxIdleTime,maxHoldingTime,riseBuyTrigger,
    sellFactorOverTarget,sellFactorWhileUnderTarget,targetProfit,buyTriggerFactor) {
  const bitfinexFee = 0.002;
  let lowestPrice = 999999999;
  let highestPrice = 0;
  let dataset = [];
  for(let i=0;i<dataIn.length;i++){
    const obj = dataIn[i];  
    dataset[i]={
        date: obj.date,
        close: obj.close,
        close2: obj.close2,
    }
  }
  dataset = rebase(dataset, 0);
  let readyForBuySignal1 = false;
  let readyForBuySignal2 = false;
  let holding = false;
  let profitFactor = 1;
  let buyPrice;
  let holdingTime = 0;
  let idleTime = 0;
  const buyPoints = [];
  const sellPoints = [];
  let rebasedDataset = [];
  let lastRebaseIndex = 0;
  for (let i = 0; i < dataset.length; i++) {
    const { close, close2 } = dataset[i];
    if(holding) {
        holdingTime++;
    } else {
       idleTime++;
    }
    if(!holding){
        if (close2 < close) {
            if(!readyForBuySignal1){// on triggered
                lowestPrice = 999999999;
                highestPrice = 0;
            }
            readyForBuySignal1=true; // continuous check
        } else{
            readyForBuySignal1=false; // continuous check
        }
    }

    if(readyForBuySignal1 && !holding){
        if(close2<lowestPrice){
            lowestPrice = close2;
        }
        if(close2>=(riseBuyTrigger*lowestPrice)){
            readyForBuySignal2 = true;
        }
    }

    if(readyForBuySignal2 && !holding){
        if(close2<=buyTriggerFactor*close){
            //console.log("BUY");
            buyPoints.push(i);
            buyPrice = close2;
            holding = true;
        }
    }

    if(holding){
        if(close2>highestPrice){
            highestPrice = close2;
        }
        const currentProfit = (1-bitfinexFee)*(1-bitfinexFee)*(close2/buyPrice);
        if(currentProfit<targetProfit){
            if(close2<(sellFactorWhileUnderTarget*buyPrice) && holding){
                //console.log("SELL")
                sellPoints.push(i);
                profitFactor *= currentProfit;
                idleTime = 0;
                holding = false;
                readyForBuySignal1 = false;
                readyForBuySignal2=false;
                lowestPrice = 999999999;
                highestPrice = 0;
                holdingTime=0;
            }
        }else{
            if(close2<=(sellFactorOverTarget*highestPrice) && holding){
                //console.log("SELL")
                sellPoints.push(i);
                profitFactor *= currentProfit;
                holding = false;
                idleTime = 0;
                readyForBuySignal1 = false;
                readyForBuySignal2=false;
                lowestPrice = 999999999;
                highestPrice = 0;
                holdingTime=0;
            }
        }
     }

    if(holding && holdingTime > maxHoldingTime){
        sellPoints.push(i);
        profitFactor *= (1-bitfinexFee)*(1-bitfinexFee)*(close2/buyPrice);
        holding = false;
        idleTime = 0;
        readyForBuySignal1 = false;
        readyForBuySignal2=false;
        lowestPrice = 999999999;
        highestPrice = 0;
        holdingTime=0;
    }

    if(!holding && idleTime>maxIdleTime){
      /*  for(let j=lastRebaseIndex;j<i;j++){
            rebasedDataset.push({...dataset[j]});
        }*/
        dataset = rebase(dataset, i);
        lastRebaseIndex = i;
        //console.log("Rebasing at "+dataset[i].date)
        idleTime = 0;
    }

  }
/*
  for(let j=lastRebaseIndex;j<dataset.length-1;j++){
    rebasedDataset.push({...dataset[j]});
  }
*/
  /*for(let j=0;j<rebasedDataset.length-1;j++){
    rebasedDataset[j].close = rebasedDataset[j].close2;
  }*/
  //console.log(rebasedDataset)
  //console.log(profitFactor);
  //console.log(buyPoints);
  //console.log(sellPoints);
  return [buyPoints, sellPoints, rebasedDataset, profitFactor];
}
