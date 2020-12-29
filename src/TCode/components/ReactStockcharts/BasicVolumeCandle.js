import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { ChartCanvas, Chart } from 'react-stockcharts/'
import { scaleTime } from 'd3-scale';
import { CandlestickSeries, BarSeries } from 'react-stockcharts/lib/series';
import { XAxis, YAxis } from 'react-stockcharts/lib/axes';
import { timeIntervalBarWidth } from 'react-stockcharts/lib/utils';
import { fitWidth } from 'react-stockcharts/lib/helper';
import { format } from 'd3-format';
import { MouseCoordinateY } from 'react-stockcharts/lib/coordinates';
import { v4 as uuidv4 } from 'uuid'
/* eslint react/prop-types: 0 */

const ChartJS = React.forwardRef((props, ref) => {
  const [state, setState] = useState({
    historicalData: [],
    showHistorical: false,
    idRoot: uuidv4(),
    id1: uuidv4(),
    id2: uuidv4(),
  });
  function fetchHistoricalData() {
    fetch(`http://localhost:3001/getCandles?ticker=${props.activeMarket.restID}`).then(response => { return response.json() })
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
        setState(() => ({
          ...state,
          historicalData: processedData,
          showHistorical: true,
        }))
      });
  }
  useEffect(() => {
    fetchHistoricalData()
  }, [props.activeMarket])
  const {
    showHistorical, id1, id2, idRoot,
  } = state;
  const { type, width, ratio } = props
  const xAccessor = (d) => { return d.date }
  const dummy = { date: new Date() }
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
        xScale={scaleTime()}
        xExtents={xExtents}
        ref={ref}
        onZoomTiti={onZoomTiti}
      >
        <Chart
          id={id1}
          yExtents={[d => d.volume]}
          height={0.3 * height}
          origin={(w, h) => [0, h - 0.3 * height]}
        >
          <YAxis axisAt='left' orient='left' ticks={5} tickFormat={format('.2s')} stroke='#B2B5BE' tickStroke='#B2B5BE' />
          <MouseCoordinateY
            at='left'
            orient='left'
            displayFormat={format('.4s')}
          />
          <BarSeries
            yAccessor={d => d.volume}
            widthRatio={0.95}
            opacity={0.5}
            fill={d => {
              let color = (d.close > d.open ? 'grey' : 'blue')
              if (d.volume > 50) color = 'orange'
              return color
            }}
            width={timeIntervalBarWidth({
              offset: (date) => {
                return new Date(date.getTime() + 30 * 60 * 1000);
              },
            })}
          />
        </Chart>
        <Chart id={id2} yExtents={(d) => [d.high, d.low]}>
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
      )}
    </div>
  );
});

ChartJS.prototype = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  ratio: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['svg', 'hybrid']).isRequired,
};

ChartJS.defaultProps = {
  type: 'svg',
  width: 1920,
  ratio: 1,
};

const OutChartJS = fitWidth(ChartJS);

export default OutChartJS;
