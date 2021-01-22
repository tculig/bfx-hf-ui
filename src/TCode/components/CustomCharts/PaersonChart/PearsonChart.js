import { scaleLinear } from 'd3-scale';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Chart, ChartCanvas } from 'react-stockcharts/';
import { XAxis, YAxis } from 'react-stockcharts/lib/axes';
import { fitWidth } from 'react-stockcharts/lib/helper';
import { LineSeries } from 'react-stockcharts/lib/series';
import { v4 as uuidv4 } from 'uuid';
import GenericChartPanel from './GenericChartPanel'
/* eslint react/prop-types: 0 */

const PearsonChart = React.forwardRef((props, ref) => {
  const [state, setState] = useState({
    historicalData: [],
    showHistorical: false,
    idRoot: uuidv4(),
    id1: uuidv4(),
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

  function processPaerson(data1, data2) {
    const paersonData = [];
    const offsetMax = 50;
    for (let offset = -offsetMax; offset <= offsetMax; offset++) {
      const d1 = [];
      const d2 = [];
      for (let i = offsetMax; i < data1.length - offsetMax; i++) {
        d1.push(data1[i].close);
        d2.push(data2[i + offset].close);
      }
      const per = corr(d1, d2);
      paersonData.push({
        offset,
        paerson: per,
      });
    }
    return paersonData;
  }

  useEffect(() => {
    async function runAsync() {
      const data1 = await fetchHistoricalData(props.activeMarket[GenericChartPanel.marketIDS[0]].restID)
      const data2 = await fetchHistoricalData(props.activeMarket[GenericChartPanel.marketIDS[1]].restID)
      const paersonResults = processPaerson(data1, data2);
      setState(() => ({
        ...state,
        historicalData: paersonResults,
        showHistorical: true,
      }))
    }
    runAsync();
  }, [props.activeMarket])
  const {
    showHistorical, id1, idRoot,
  } = state;
  const { type, width, ratio } = props

  const xAccessor = (d) => { return d?.offset }
  const dummy = { offset: 0 }
  const start = xAccessor(state.historicalData[0] || dummy)
  const end = xAccessor(state.historicalData[state.historicalData.length - 1] || dummy)

  let xExtents = [start, end]
  if (props.xExtentsCommon != null) {
    if (props.xExtentsCommon.id !== idRoot) {
      xExtents = props.xExtentsCommon.extents
    }
  }
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
      <ChartCanvas
        id={idRoot}
        height={height}
        ratio={ratio}
        width={width}
        margin={{
          left: 50, right: 50, top: 10, bottom: 30,
        }}
        type={type}
        data={state.historicalData}
        seriesName='MSFT'
        xAccessor={xAccessor}
        displayXAccessor={xAccessor}
        xScale={scaleLinear()}
        xExtents={xExtents}
        ref={ref}
        onZoomTiti={onZoomTiti}
      >
        <Chart id={id1} yExtents={(d) => [d.paerson]}>
          <XAxis axisAt='bottom' orient='bottom' ticks={16} stroke='#B2B5BE' tickStroke='#B2B5BE' />
          <YAxis axisAt='right' orient='right' ticks={15} stroke='#B2B5BE' tickStroke='#B2B5BE' />
          <LineSeries
            yAccessor={d => d.paerson}
          />
        </Chart>
      </ChartCanvas>
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
