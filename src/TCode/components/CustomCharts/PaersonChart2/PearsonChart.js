/* eslint-disable */
import { scaleLinear, scaleTime } from "d3-scale";
import PropTypes from "prop-types";
import React, { useEffect, useState, useRef } from "react";
import { format } from "d3-format";
import { Chart, ChartCanvas } from "react-stockcharts/";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { fitWidth } from "react-stockcharts/lib/helper";
import { timeIntervalBarWidth } from "react-stockcharts/lib/utils";
import {
  LineSeries,
  CandlestickSeries,
  BarSeries,
  SquareMarker,
  ScatterSeries
} from "react-stockcharts/lib/series";
import { ClickCallback } from "react-stockcharts/lib/interactive";
import {
  MouseCoordinateY,
  MouseCoordinateX,
  CrossHairCursor,
  CurrentCoordinate,
} from "react-stockcharts/lib/coordinates";
import { v4 as uuidv4 } from "uuid";
import GenericChartPanel from "./GenericChartPanel";
import IntersectionBasic from "../../TradingStrategy/IntersectionBasic";

const _ = require('lodash'); 
const PearsonChart = React.forwardRef((props, ref) => {
  const dummyPaerson=[{
    offset: -1,
    paerson: 0
  },{
    offset: 0,
    paerson: 0
  },{
    offset: 1,
    paerson: 0
  }]
  const [state, setState] = useState({
    historicalData: [],
    paersonData: dummyPaerson,
  });
  const dataSetSize = 10000;
  const maxOffset = 200;
  const bitcoinDataShowing = useRef();
  const data1 = useRef();
  const data2 = useRef();
  const hasPoints = useRef(false);

  async function fetchHistoricalData(ticker) {
    const result = fetch(`http://localhost:3001/getCandles?ticker=${ticker}`).then(response => { return response.json() })
      .then(data => {
        const processedData = []
        for (let i = 0; i < dataSetSize; i++) {
          const dataPoint = data[i];
          processedData.push({
            date: new Date(dataPoint[0]),
            open: dataPoint[1],
            close: dataPoint[2],
            high: dataPoint[3],
            low: dataPoint[4],
            volume: dataPoint[5],
            buyPoint: null,
            sellPoint: null
          });
        }
        processedData.reverse()
        return processedData
      });
    return result
  }

  function myTestCor(x, y) {
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0,
      sumY2 = 0;
    const minLength = Math.min(x.length, y.length);
    let weightUpDownFactor = 1;
    for(let i = 1; i < x.length; i++){
      const xupdown = (x[i]-x[i-1])>0 ? 1 : -1;
      const yupdown = (y[i]-y[i-1])>0 ? 1 : -1;
      if(xupdown === yupdown) weightUpDownFactor+=0.1;
    }
    const reduce = (xi, idx) => {
        const yi = y[idx];
        sumX += xi;
        sumY += yi;
        sumXY += xi * yi;
        sumX2 += xi * xi;
        sumY2 += yi * yi;
      }
    x.forEach(reduce);
    return weightUpDownFactor * (minLength * sumXY - sumX * sumY) / Math.sqrt((minLength * sumX2 - sumX * sumX) * (minLength * sumY2 - sumY * sumY));
  }

  const { type, width, ratio } = props

  const xAccessorPaerson = (d) => { return d?.offset }
  const dummyPaersonX = { offset: 0 }
  const startPaerson = xAccessorPaerson(state.paersonData[0] || dummyPaersonX)
  const endPaerson = xAccessorPaerson(state.paersonData[state.paersonData.length - 1] || dummyPaersonX)
  const xExtentsPaerson = [startPaerson, endPaerson]

  const xAccessor = (d) => { return d.date }
  const dummy = { date: new Date() }
  const start1 = xAccessor(state.historicalData[maxOffset] || dummy)
  const end1 = xAccessor(state.historicalData[state.historicalData.length - maxOffset-1] || dummy)

  let xExtents1 = [start1, end1]

  function onZoomTiti(zoomDir) {
    props.updateXExtends({
      id: "idRoot",
      extents: zoomDir,
    });
  }

  function processPaerson(dataset1, dataset2, offsetRange ) {
    const paersonData = [];
    if(offsetRange === 0) return false;
    for (let offset = -offsetRange; offset <= offsetRange; offset++) {
      const d1 = [];
      const d2 = [];
      for (let i = offsetRange; i < dataset1.length - offsetRange; i++) {
        d1.push(dataset1[i].close);
        d2.push(dataset2[i + offset].close);
      }
      const per = myTestCor(d1, d2);
      paersonData.push({
        offset,
        paerson: per,
      });
    }
    return paersonData;
  }

  async function recalculatePearson() {
    const firstTime = bitcoinDataShowing.current[0].date.getTime();
    const lastTime = bitcoinDataShowing.current[bitcoinDataShowing.current.length-1].date.getTime();
    const dataset2 = data2.current;
    let startIndex = 0;
    let endIndex = dataset2.length - 1;
    for(let i = 0; i < dataset2.length; i++){
      if(dataset2[i].date.getTime() === firstTime) {
        startIndex = i;
      }else if(dataset2[i].date.getTime() === lastTime) {
        endIndex = i;
        break;
      }
    }
    const mOffset = Math.max(0, Math.min(maxOffset, startIndex, dataset2.length - endIndex -2));
    const paersonResults = processPaerson(bitcoinDataShowing.current, data2.current, mOffset, startIndex)
    if(paersonResults){
      setState(() => ({
        ...state,
        paersonData: paersonResults
      }))
    }else{
      setState(() => ({
        ...state,
        paersonData: dummyPaerson
      }))
      
    }
  }

  function getFactor(offset) {
    const refTime = bitcoinDataShowing.current[0].date.getTime();
    let indexOfFirst;
    for(let i=0;i<data1.current.length;i++){
      if(data1.current[i].date.getTime()===refTime){
        indexOfFirst=i;
        break;
      }
    }
    const factor = data1.current[indexOfFirst].close / data2.current[indexOfFirst+offset].close;
    return factor;
  }

  function shiftDependendGraph(props) {
    const offset = props.currentItem.offset;
    const factor = getFactor(offset);
    const len = data2.current.length-1;
    for(let i=0;i<data1.current.length;i++){
      if((i+offset)<0 || (i+offset)>len){
        data1.current[i].close2 = null;
      }else{
        data1.current[i].close2 = data2.current[i+offset].close*factor;
      }
    }
    setState(() => ({
      ...state,
      historicalData: data1.current
    }));
  }



  // 
  function paddData(trim) {
    let dataset1 = _.cloneDeep(data1.current);
    let dataset2 = _.cloneDeep(data2.current);
     let flipped = false;
    let result1 = [];
    let result2 = [];
    //dataset1 is always the one with the later start date
    if(dataset1[0].date.getTime()<dataset2[0].date.getTime()){
      dataset1 = _.cloneDeep(data2.current);
      dataset2 = _.cloneDeep(data1.current);
      flipped = true;
    }
    const firstDateTime = dataset1[0].date.getTime();
    const lastDateTime = dataset1[dataset1.length-1].date.getTime();
    let currentDateTime = firstDateTime;
    while(dataset1[0].date.getTime() < currentDateTime){
      dataset1.shift();
    }
    while(dataset2[0].date.getTime() < currentDateTime){
      dataset2.shift();
    }
    let lastFromDataset1 = {...dataset1[0]};
    let lastFromDataset2 = {...dataset2[0]};
    let thisDate = new Date(currentDateTime);
    while(currentDateTime <= lastDateTime) {
      // dataset1
      if(dataset1.length>0 && dataset1[0].date.getTime()==currentDateTime){
        result1.push(dataset1[0]);
        lastFromDataset1 = {...dataset1[0]};
        dataset1.shift();
      }else{
        result1.push({
          ...lastFromDataset1,
          date: thisDate
        });
      }
      // dataset2
      if(dataset2.length>0 && dataset2[0].date.getTime()==currentDateTime){
        result2.push(dataset2[0]);
        lastFromDataset2 = {...dataset2[0]};
        dataset2.shift();
      }else{
        result2.push({
          ...lastFromDataset2,
          date: thisDate
        });
      }
      thisDate = new Date(currentDateTime + 60000)
      currentDateTime = thisDate.getTime()
    }
    if(flipped){
      data1.current = result2;
      data2.current = result1;
    } else {
      data1.current = result1;
      data2.current = result2;
    }
  }

  useEffect(() => {
    async function fetchAsync() {
      data1.current = await fetchHistoricalData(props.activeMarket[GenericChartPanel.marketIDS[0]].restID)
      data2.current = await fetchHistoricalData(props.activeMarket[GenericChartPanel.marketIDS[1]].restID)
      paddData();
      const factor = data1.current[0].close / data2.current[0].close;
      for(let i=0;i<data1.current.length;i++){
        data1.current[i].close2 = data2.current[i].close*factor;
      }

      const arr1Length = data1.current.length;
      bitcoinDataShowing.current = data1.current.filter(function(value, index, arr){ 
        return (index >= maxOffset && index < arr1Length - maxOffset);
      });
      setState(() => ({
        ...state,
        historicalData: data1.current,
      }))
    }
    fetchAsync();
  }, [props.activeMarket])

  useEffect(() => {
    async function fetchAsync() {
      recalculatePearson();
    }
    if(state.historicalData.length>0){
      fetchAsync();
    }
  }, [state.historicalData])

  function btcRightClick(props) {
    bitcoinDataShowing.current = props.plotData;
    const factor = getFactor(0);
    //setDependentGraphOffset(0);
    for(let i=0;i<data1.current.length;i++){
      data1.current[i].close2 = data2.current[i].close*factor;
    }
    const [buyPoints, sellPoint] = IntersectionBasic(data1.current);
    buyPoints.forEach((value)=>{
      data1.current[value].buyPoint = data1.current[value].close2;
    });
    sellPoint.forEach((value)=>{
      data1.current[value].sellPoint = data1.current[value].close2;
    });
    hasPoints.current = true;
    recalculatePearson();
  }

  const { height } = props;
  return (
    <div className="ChartJS">
      {state.historicalData.length>0 && (
        <>
          <div id="PaersonChart">
            <ChartCanvas
              id="idPaerson"
              height={height / 3}
              ratio={ratio}
              width={width}
              margin={{
                left: 50,
                right: 50,
                top: 0,
                bottom: 30,
              }}
              type={type}
              data={state.paersonData}
              seriesName="MSFT"
              xAccessor={xAccessorPaerson}
              displayXAccessor={xAccessorPaerson}
              xScale={scaleLinear()}
              xExtents={xExtentsPaerson}
              ref={ref}
            >
              <Chart id="id1" yExtents={(d) => [d.paerson]}>
                <ClickCallback
                  onContextMenu={(props) => {
                    shiftDependendGraph(props);
                  }}
                />
                <XAxis
                  axisAt="bottom"
                  orient="bottom"
                  ticks={16}
                  stroke="#B2B5BE"
                  tickStroke="#B2B5BE"
                />
                <YAxis
                  axisAt="right"
                  orient="right"
                  ticks={15}
                  stroke="#B2B5BE"
                  tickStroke="#B2B5BE"
                />
                <MouseCoordinateX
                  at="bottom"
                  orient="bottom"
                  displayFormat={format("i")}
                />
                <MouseCoordinateY
                  at="left"
                  orient="left"
                  displayFormat={format(".4f")}
                />
                <LineSeries highlightOnHover yAccessor={(d) => d.paerson} />
                <CurrentCoordinate
                  yAccessor={(d) => d.paerson}
                  fill="#ff1111"
                />
              </Chart>
              <CrossHairCursor stroke="#ffffff" />
            </ChartCanvas>
          </div>
          <div id="bitcoinCandle">
            <ChartCanvas
              id="idCompare"
              height={(2 * height) / 3}
              ratio={ratio}
              width={width}
              margin={{
                left: 50,
                right: 50,
                top: 10,
                bottom: 30,
              }}
              type={type}
              data={state.historicalData}
              seriesName="MSFT"
              xAccessor={xAccessor}
              displayXAccessor={xAccessor}
              xScale={scaleTime()}
              xExtents={xExtents1}
              ref={ref}
              onZoomTiti={onZoomTiti}
            >
              <Chart
                id="id2"
                yExtents={(d) => [d.close, d.close2]}
                height={(3 * 0.6 * height) / 3}
                origin={(w, h) => [0, h - (3 * 0.6 * height) / 3]}
              >
                <ClickCallback
                  onContextMenu={(props) => {
                    btcRightClick(props);
                  }}
                />
                <XAxis
                  axisAt="bottom"
                  orient="bottom"
                  ticks={16}
                  stroke="#B2B5BE"
                  tickStroke="#B2B5BE"
                />
                <YAxis
                  axisAt="right"
                  orient="right"
                  ticks={15}
                  stroke="#B2B5BE"
                  tickStroke="#B2B5BE"
                />
                <LineSeries
                  stroke="#2ca02c"
                  highlightOnHover
                  yAccessor={(d) => d.close}
                />
                <LineSeries
                  stroke="#ff7f0e"
                  highlightOnHover
                  yAccessor={(d) => d.close2}
                />
                {hasPoints.current && 
                <>
                  <ScatterSeries
                    yAccessor={d => d.buyPoint}
                    marker={SquareMarker}
                    markerProps={{ width: 18, stroke: "green", fill: "green" }}
                 />
                 <ScatterSeries
                    yAccessor={d => d.sellPoint}
                    marker={SquareMarker}
                    markerProps={{ width: 18, stroke: "red", fill: "red" }}
                 />
                </>}

              </Chart>
            </ChartCanvas>
          </div>
        </>
      )}
    </div>
  );
});

PearsonChart.prototype = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  ratio: PropTypes.number.isRequired,
  type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

PearsonChart.defaultProps = {
  type: "svg",
  width: 1920,
  ratio: 1,
};

const OutPearsonChart = fitWidth(PearsonChart);

export default OutPearsonChart;
