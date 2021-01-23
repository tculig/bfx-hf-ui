/* eslint-disable */
import { scaleLinear, scaleTime } from 'd3-scale';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef } from 'react';
import { format } from 'd3-format';
import { Chart, ChartCanvas } from 'react-stockcharts/';
import { XAxis, YAxis } from 'react-stockcharts/lib/axes';
import { fitWidth } from 'react-stockcharts/lib/helper';
import { timeIntervalBarWidth } from 'react-stockcharts/lib/utils';
import { LineSeries, CandlestickSeries } from 'react-stockcharts/lib/series';
import { ClickCallback } from "react-stockcharts/lib/interactive";
import { MouseCoordinateY, MouseCoordinateX, CrossHairCursor, CurrentCoordinate } from 'react-stockcharts/lib/coordinates';
import { v4 as uuidv4 } from 'uuid';
import GenericChartPanel from './GenericChartPanel'
/* eslint react/prop-types: 0 */

const PearsonChart = React.forwardRef((props, ref) => {
  const [state, setState] = useState({
    historicalData1: [],
    historicalData2: [],
    paersonData: [],
    showHistorical: false,
    idRoot: uuidv4(),
    id1: uuidv4(),
    id2: uuidv4(),
    id3: uuidv4(),
    id4: uuidv4(),
  });

  async function fetchHistoricalData(ticker) {
    const result = fetch(`http://localhost:3001/getCandles?ticker=${ticker}`).then(response => { return response.json() })
      .then(data => {
        const processedData = []
        for (let i = 0; i < 1000; i++) {
          const dataPoint = data[i];
          processedData.push({
            date: new Date(dataPoint[0]),
            open: dataPoint[1],
            close: dataPoint[2],
            high: dataPoint[3],
            low: dataPoint[4],
            volume: dataPoint[5],
          });
        }
        processedData.reverse()
        return processedData
      });
    return result
  }

  function corr(d1, d2) {
    const { min, sqrt } = Math;
    const add = (a, b) => a + b;
    const n = min(d1.length, d2.length);
    if (n === 0) {
      return 0;
    }
    const [d1slice, d2slice] = [d1.slice(0, n), d2.slice(0, n)];
    const [sum1, sum2] = [d1slice, d2slice].map((l) => l.reduce(add));
    const [pow1, pow2] = [d1slice, d2slice].map((l) => l.reduce((a, b) => a + (b * b), 0));
    const mulSum = d1slice.map((en, i) => en * d2slice[i]).reduce(add);
    const dense = sqrt((pow1 - (sum1 * sum1) / n) * (pow2 - (sum2 * sum2) / n));
    if (dense === 0) {
      return 0;
    }
    return (mulSum - (sum1 * sum2) / n) / dense;
  }

  function processPaerson(dataset1, dataset2, offsetMax, offsetWindow) {
    const paersonData = [];
    for (let offset = -offsetMax; offset <= offsetMax; offset++) {
      const d1 = [];
      const d2 = [];
      for (let i = offsetMax + offsetWindow[0]; i < offsetMax + offsetWindow[0] + offsetWindow[1]; i++) {
        d1.push(dataset1[i].close);
        d2.push(dataset2[i + offset].close);
      }
      const per = corr(d1, d2);
      paersonData.push({
        offset,
        paerson: per,
      });
    }
    return paersonData;
  }
  const data1 = useRef();
  const data2 = useRef();
  const offsetRef = useRef([0, 500]);
  const intervalRef = useRef();
  const [dependentGraphOffset, setDependentGraphOffset] = useState(0);

  async function runAsync() {
    data1.current = await fetchHistoricalData(props.activeMarket[GenericChartPanel.marketIDS[0]].restID)
    data2.current = await fetchHistoricalData(props.activeMarket[GenericChartPanel.marketIDS[1]].restID)
    intervalRef.current = setInterval(() => {
      const paersonResults = processPaerson(data1.current, data2.current, 100, offsetRef.current)
      offsetRef.current[0]++
      console.log(`${offsetRef.current[0]} ${data1.current[offsetRef.current[0]].date} ${data1.current[offsetRef.current[0] + offsetRef.current[1]].date}`)
      if (offsetRef.current[0] > 0) {
        clearInterval(intervalRef.current)
      }
      setState(() => ({
        ...state,
        historicalData1: data1.current,
        historicalData2: data2.current,
        paersonData: paersonResults,
        showHistorical: true,
      }))
    }, 100);
  }
  useEffect(() => {
    runAsync();
  }, [props.activeMarket])

  function recalculatePearson() {
    const xExtentsCurrent = props.xExtentsCommon.extents;
    console.log(xExtentsCurrent)
  }

  function shiftDependendGraph(props) {
    setDependentGraphOffset(props.currentItem.offset);
  }

  const { showHistorical, id1, idRoot, id2, id3, id4 } = state;
  const { type, width, ratio } = props

  const xAccessorPaerson = (d) => { return d?.offset }
  const dummyPaerson = { offset: 0 }
  const startPaerson = xAccessorPaerson(state.paersonData[0] || dummyPaerson)
  const endPaerson = xAccessorPaerson(state.paersonData[state.paersonData.length - 1] || dummyPaerson)
  let xExtentsPaerson = [startPaerson, endPaerson]

  const xAccessor = (d) => { return d.date }
  const dummy = { date: new Date() }
  const start1 = xAccessor(state.historicalData1[0] || dummy)
  const end1 = xAccessor(state.historicalData1[state.historicalData1.length - 1] || dummy)

  let xExtents1 = [start1, end1]
  let xExtents2 = [start1, end1]
  if (props.xExtentsCommon != null) {
      xExtents2 = props.xExtentsCommon.extents
  }
  xExtents2 = xExtents2.map(el => (new Date(el.getTime() + 1000*60*30*dependentGraphOffset)));
  function onZoomTiti(zoomDir) {
    props.updateXExtends({
      id: idRoot,
      extents: zoomDir,
    });
  }
  const { height } = props
  return (
    <div className='ChartJS'>
      {showHistorical
      && (
      <>  
      <div id="PaersonChart">
        <ChartCanvas
          id={idRoot}
          height={height / 3}
          ratio={ratio}
          width={width}
          margin={{
            left: 50, right: 50, top: 10, bottom: 30,
          }}
          type={type}
          data={state.paersonData}
          seriesName='MSFT'
          xAccessor={xAccessorPaerson}
          displayXAccessor={xAccessorPaerson}
          xScale={scaleLinear()}
          xExtents={xExtentsPaerson}
          ref={ref}
        >
          <Chart id={id1} yExtents={(d) => [d.paerson]}>
            <ClickCallback
              onContextMenu={(props) => {shiftDependendGraph(props)}}
            />
            <XAxis axisAt='bottom' orient='bottom' ticks={16} stroke='#B2B5BE' tickStroke='#B2B5BE' />
            <YAxis axisAt='right' orient='right' ticks={15} stroke='#B2B5BE' tickStroke='#B2B5BE' />
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
            <LineSeries
              highlightOnHover
              yAccessor={d => d.paerson}
            />
            <CurrentCoordinate yAccessor={d => d.paerson} fill='#ff1111' />
          </Chart>
          <CrossHairCursor stroke="#ffffff" />
        </ChartCanvas>
      </div>
      <div id="bitcoinCandle">
        <ChartCanvas
          id={idRoot}
          height={height/3}
          ratio={ratio}
          width={width}
          margin={{
            left: 50, right: 50, top: 10, bottom: 30,
          }}
          type={type}
          data={state.historicalData1}
          seriesName='MSFT'
          xAccessor={xAccessor}
          displayXAccessor={xAccessor}
          xScale={scaleTime()}
          xExtents={xExtents1}
          ref={ref}
          onZoomTiti={onZoomTiti}
        >
        <Chart
          id={id1}
          yExtents={[d => d.volume]}
          height={0.5*height/3}
          origin={(w, h) => [0, h - 0.5*height/3]}
        >
          <ClickCallback
						onContextMenu={recalculatePearson}
					/>
          <YAxis axisAt='left' orient='left' ticks={5} tickFormat={format('.2s')} stroke='#B2B5BE' tickStroke='#B2B5BE' />
          <MouseCoordinateY
            at='left'
            orient='left'
            displayFormat={format('.4s')}
          />
          {/*<BarSeries
            yAccessor={d => d.volume}
            widthRatio={0.95}
            opacity={0.5}
            fill={d => (d.close > d.open ? 'grey' : 'blue')}
            width={timeIntervalBarWidth({
              offset: (date) => {
                return new Date(date.getTime() + 30 * 60 * 1000);
              },
            })}
          />*/}
        </Chart>
        <Chart 
          id={id2} 
          yExtents={(d) => [d.high, d.low]}
          height={0.5*height/3}
          origin={(w, h) => [0, h - 0.5*height/3]}
        >
          <XAxis axisAt='bottom' orient='bottom' ticks={16} stroke='#B2B5BE' tickStroke='#B2B5BE' />
          <YAxis axisAt='right' orient='right' ticks={15} stroke='#B2B5BE' tickStroke='#B2B5BE' />
          <CandlestickSeries
            opacity={1}
            fill={d => (d.close > d.open ? '#2FA69A' : '#ED5053')}
            wickStroke={d => (d.close > d.open ? '#2FA69A' : '#ED5053')}
            width={timeIntervalBarWidth({
              offset: (date) => {
                return new Date(date.getTime() + 30 * 60 * 1000);
              },
            })}
          />
        </Chart>
      </ChartCanvas>
      </div>
      <div id="ethCandle">
        <ChartCanvas
          id={idRoot}
          height={height/3}
          ratio={ratio}
          width={width}
          margin={{
            left: 50, right: 50, top: 10, bottom: 30,
          }}
          type={type}
          data={state.historicalData2}
          seriesName='MSFT'
          xAccessor={xAccessor}
          displayXAccessor={xAccessor}
          xScale={scaleTime()}
          xExtents={xExtents2}
          ref={ref}
          onZoomTiti={onZoomTiti}
        >
        <Chart
          id={id3}
          yExtents={[d => d.volume]}
          height={0.5*height/3}
          origin={(w, h) => [0, h - 0.5*height/3]}
        >
          <YAxis axisAt='left' orient='left' ticks={5} tickFormat={format('.2s')} stroke='#B2B5BE' tickStroke='#B2B5BE' />
          <MouseCoordinateY
            at='left'
            orient='left'
            displayFormat={format('.4s')}
          />
          {/*<BarSeries
            yAccessor={d => d.volume}
            widthRatio={0.95}
            opacity={0.5}
            fill={d => (d.close > d.open ? 'grey' : 'blue')}
            width={timeIntervalBarWidth({
              offset: (date) => {
                return new Date(date.getTime() + 30 * 60 * 1000);
              },
            })}
          />*/}
        </Chart>
        <Chart 
          id={id4} 
          yExtents={(d) => [d.high, d.low]}
          height={0.5*height/3}
          origin={(w, h) => [0, h - 0.5*height/3]}
        >
          <XAxis axisAt='bottom' orient='bottom' ticks={16} stroke='#B2B5BE' tickStroke='#B2B5BE' />
          <YAxis axisAt='right' orient='right' ticks={15} stroke='#B2B5BE' tickStroke='#B2B5BE' />
          <CandlestickSeries
            opacity={1}
            fill={d => (d.close > d.open ? '#2FA69A' : '#ED5053')}
            wickStroke={d => (d.close > d.open ? '#2FA69A' : '#ED5053')}
            width={timeIntervalBarWidth({
              offset: (date) => {
                return new Date(date.getTime() + 30 * 60 * 1000);
              },
            })}
          />
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
  type: PropTypes.oneOf(['svg', 'hybrid']).isRequired,
};

PearsonChart.defaultProps = {
  type: 'svg',
  width: 1920,
  ratio: 1,
};

const OutPearsonChart = fitWidth(PearsonChart);

export default OutPearsonChart;
