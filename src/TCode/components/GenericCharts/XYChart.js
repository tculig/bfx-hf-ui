import { scaleTime } from 'd3-scale';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Chart, ChartCanvas } from 'react-stockcharts/';
import { XAxis, YAxis } from 'react-stockcharts/lib/axes';
import { fitWidth } from 'react-stockcharts/lib/helper';
import { LineSeries } from 'react-stockcharts/lib/series';
import { v4 as uuidv4 } from 'uuid';
import GenericChartPanel from '../GenericChartPanel/GenericChartPanel'
/* eslint react/prop-types: 0 */

const ChartJS = React.forwardRef((props, ref) => {
  const [state, setState] = useState({
    historicalData: [],
    showHistorical: false,
    idRoot: uuidv4(),
    id1: uuidv4(),
  });
  function fetchHistoricalData() {
    fetch(`http://localhost:3001/getCandles?ticker=${props.activeMarket[GenericChartPanel.marketIDS[0]].restID}`).then(response => { return response.json() })
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
    showHistorical, id1, idRoot,
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
        displayXAccessor={xAccessor}
        xScale={scaleTime()}
        xExtents={xExtents}
        ref={ref}
        onZoomTiti={onZoomTiti}
      >
        <Chart id={id1} yExtents={(d) => [d.high, d.low]}>
          <XAxis axisAt='bottom' orient='bottom' ticks={16} stroke='#B2B5BE' tickStroke='#B2B5BE' />
          <YAxis axisAt='right' orient='right' ticks={15} stroke='#B2B5BE' tickStroke='#B2B5BE' />
          <LineSeries
            yAccessor={d => d.close}
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
