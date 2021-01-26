/* eslint-disable */
import { rebase } from "./utils";
import BelowBasicBatchTest from "./BelowBasicBatchTest";

const _ = require("lodash");

export default function BelowBasic(dataIn) {
  const bitfinexFee = 0.002;
  let maxHoldingTime = 100;
  let maxIdleTime = 200;
  let riseBuyTrigger = 1.02;
  let sellFactorOverTarget = 0.99;
  let sellFactorWhileUnderTarget = 0.95;
  let targetProfit = 1.00;
  let buyTriggerFactor = 0.95;
  let maxProfit = 0;
  const profitArray = [];
  const test = true;
  let temp = 0;
  let dataset = _.cloneDeep(dataIn);
  dataset = rebase(dataset, 0);

  
  if(test){
    for(let offsetIndex = 0;offsetIndex<=0;offsetIndex++){ 
        console.log(offsetIndex);
        for(let i=0;i<dataIn.length;i++){
            const obj = dataIn[i];  
            dataset[i]={
                date: obj.date,
                close: obj.close,
                close2: obj.close2,
            }
        }
        dataset = rebase(dataset, offsetIndex); 
        maxProfit=0;
        maxHoldingTime = 100;
        maxIdleTime = 200;
        riseBuyTrigger = 1.02;
        sellFactorOverTarget = 0.99;
        sellFactorWhileUnderTarget = 0.95;
        targetProfit = 1.00;
        buyTriggerFactor = 0.95;
        for(let buyTriggerFactor=0.95;buyTriggerFactor<1.05;buyTriggerFactor+=0.001) {
            const [x,y,z,profitFactorBatch] = BelowBasicBatchTest(dataset,maxIdleTime,maxHoldingTime,riseBuyTrigger,
                sellFactorOverTarget,sellFactorWhileUnderTarget,targetProfit,buyTriggerFactor);
                if(profitFactorBatch>maxProfit) {
                    maxProfit = profitFactorBatch;
                    //console.log("buyTriggerFactor: "+buyTriggerFactor+" "+maxProfit)
                    temp = buyTriggerFactor;
                }
        }
        buyTriggerFactor = temp;
        maxProfit = 0;
        for(let sellFactorWhileUnderTarget=0.95;sellFactorWhileUnderTarget<1.05;sellFactorWhileUnderTarget+=0.001) {
            const [x,y,z,profitFactorBatch] = BelowBasicBatchTest(dataset,maxIdleTime,maxHoldingTime,riseBuyTrigger,
                sellFactorOverTarget,sellFactorWhileUnderTarget,targetProfit,buyTriggerFactor);
                if(profitFactorBatch>maxProfit) {
                    maxProfit = profitFactorBatch;
                    //console.log("sellFactorWhileUnderTarget: "+sellFactorWhileUnderTarget+" "+maxProfit)
                    temp = sellFactorWhileUnderTarget;
                }
        }
        sellFactorWhileUnderTarget = temp;
        maxProfit = 0;
        for(let riseBuyTrigger=1.01;riseBuyTrigger<1.05;riseBuyTrigger+=0.001) {
            const [x,y,z,profitFactorBatch] = BelowBasicBatchTest(dataset,maxIdleTime,maxHoldingTime,riseBuyTrigger,
                sellFactorOverTarget,sellFactorWhileUnderTarget,targetProfit,buyTriggerFactor);
                if(profitFactorBatch>maxProfit) {
                    maxProfit = profitFactorBatch;
                    //console.log("riseBuyTrigger: "+riseBuyTrigger+" "+maxProfit)
                    temp = riseBuyTrigger;
                }
        }
        riseBuyTrigger = temp;
        maxProfit = 0;
        for(let maxIdleTime=60;maxIdleTime<480;maxIdleTime++) {
            const [x,y,z,profitFactorBatch] = BelowBasicBatchTest(dataset,maxIdleTime,maxHoldingTime,riseBuyTrigger,
                sellFactorOverTarget,sellFactorWhileUnderTarget,targetProfit,buyTriggerFactor);
                if(profitFactorBatch>maxProfit) {
                    maxProfit = profitFactorBatch;
                    //console.log("maxIdleTime: "+maxIdleTime+" "+maxProfit)
                    temp = maxIdleTime;
                }
        }
        maxIdleTime = temp;
        maxProfit = 0;
        for(let maxHoldingTime=60;maxHoldingTime<480;maxHoldingTime++) {
            const [x,y,z,profitFactorBatch] = BelowBasicBatchTest(dataset,maxIdleTime,maxHoldingTime,riseBuyTrigger,
                sellFactorOverTarget,sellFactorWhileUnderTarget,targetProfit,buyTriggerFactor);
                if(profitFactorBatch>maxProfit) {
                    maxProfit = profitFactorBatch;
                    //console.log("maxHoldingTime: "+maxHoldingTime+" "+maxProfit)
                    temp = maxHoldingTime;
                }
        }
        maxHoldingTime = temp;
        profitArray.push(maxProfit);
    }
  }
  for(let i=0;i<profitArray.length;i++){
      console.log(i+" "+profitArray[i]);
  }
  dataset = _.cloneDeep(dataIn);
  let lowestPrice = 999999999;
  let highestPrice = 0;
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
        for(let j=lastRebaseIndex;j<i;j++){
            rebasedDataset.push({...dataset[j]});
        }
        dataset = rebase(dataset, i);
        lastRebaseIndex = i;
        //console.log("Rebasing at "+dataset[i].date)
        idleTime = 0;
    }

  }
  for(let j=lastRebaseIndex;j<dataset.length-1;j++){
    rebasedDataset.push({...dataset[j]});
  }

  console.log(rebasedDataset)
  console.log(profitFactor);
  console.log(buyPoints);
  console.log(sellPoints);
  console.log("maxHoldingTime "+maxHoldingTime);
  console.log("maxIdleTime "+maxIdleTime);
  console.log("riseBuyTrigger "+riseBuyTrigger);
  console.log("sellFactorOverTarget "+sellFactorOverTarget);
  console.log("sellFactorWhileUnderTarget "+sellFactorWhileUnderTarget);
  console.log("targetProfit "+targetProfit);
  console.log("buyTriggerFactor "+buyTriggerFactor);
  return [buyPoints, sellPoints, rebasedDataset];
}
