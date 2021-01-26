/* eslint-disable */
import { rebase } from "./utils";

const _ = require("lodash");

export default function IntersectionBasic(dataIn) {
  const bitfinexFee = 0.002;
  const minimumCountRequiredToTrigger1 = 10;
  const minimumCountRequiredToTrigger2 = 2;
  const maxHoldingTime = 480;
  const maxIdleTime = 180;
  const trigger3Factor = 1.01;
  const sellFactor = 0.99;
  const targetProfit = 1.03;
  let lowestPrice = 999999999;
  let highestPrice = 0;
  let currentTrigger1Count = 0;
  let currentTrigger2Count = 0;
  let dataset = _.cloneDeep(dataIn);
  dataset = rebase(dataset, 0);
  let readyForBuySignal1 = false;
  let readyForBuySignal2 = false;
  let readyForBuySignal3 = false;
  let holding = false;
  let profitFactor = 1;
  let buyPrice;
  let holdingTime = 0;
  let idleTime = 0;
  const buyPoints = [];
  const sellPoints = [];
  for (let i = 0; i < dataset.length; i++) {
    const { close, close2 } = dataset[i];
    if(holding) {
        holdingTime++;
    } else {
       idleTime++;
    }
    // looking for the first condition, that the lines cross in such a way that the secondary curve is below the primary
    if (close2 < close) {
      currentTrigger1Count++;
    } else if(readyForBuySignal1 && !holding){
      currentTrigger1Count = 0;
      readyForBuySignal1 = false;
      readyForBuySignal2 = false;
      readyForBuySignal3 = false;
      lowestPrice = 999999999;
      highestPrice = 0;
      holdingTime = 0;
    }else{
      currentTrigger1Count = 0;
    }
    if (
      currentTrigger1Count > minimumCountRequiredToTrigger1 && !readyForBuySignal1) {
      //console.log("TRIGGERED 1");
      readyForBuySignal1 = true;
    }

    // if the above condition is met, then wait for the uptrend before buying
    // trigger2 is trailing, it triggers if x times in a row the price rose
    /*if (i > 0) {
      // we'll be accessing the previous member
      if (close2 > dataset[i - 1].close2) {
        currentTrigger2Count++;
      } else {
        currentTrigger2Count = 0;
        readyForBuySignal2 = false;
      }
      if (
        currentTrigger2Count > minimumCountRequiredToTrigger2 &&
        !readyForBuySignal2
      ) {
        console.log("TRIGGERED 2");
        readyForBuySignal2 = true;
      }
    }*/

    // this one wants the price to rise by a certain percentage below the bottom before triggering
    if(readyForBuySignal1){
         if(close2<lowestPrice){
            lowestPrice = close2;
        }
        if(close2>=(trigger3Factor*lowestPrice) && !readyForBuySignal3){
            //console.log("BUY");
            buyPoints.push(i);
            buyPrice = (1+bitfinexFee)*close2;
            holding = true;
            readyForBuySignal3 = true;
        }
    }

    if(readyForBuySignal3){
        if(close2>highestPrice){
            highestPrice = close2;
        }
        const currentProfit = (1-bitfinexFee)*(close2/buyPrice);
        if(currentProfit<targetProfit){
            if(close2<=(buyPrice) && holding){
                //console.log("SELL")
                sellPoints.push(i);
                profitFactor *= currentProfit;
                holding = false;
                idleTime = 0;
            }
        }else{
            if(close2<=(sellFactor*highestPrice) && holding){
                //console.log("SELL")
                sellPoints.push(i);
                profitFactor *= currentProfit;
                holding = false;
                idleTime = 0;
            }
        }
     }

    if(holding && holdingTime > maxHoldingTime){
        sellPoints.push(i);
        profitFactor *= (1-bitfinexFee)*(close2/buyPrice);
        holding = false;
        idleTime = 0;
    }

    if(!holding && idleTime>maxIdleTime){
        dataset = rebase(dataset, i);
        idleTime = 0;
    }

  }
  console.log(profitFactor);
  return [buyPoints, sellPoints];
}
