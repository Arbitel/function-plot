/**
 * Created by mauricio on 3/29/15.
 */
'use strict';

var d3 = window.d3;
module.exports = {
  COLORS: [
    'steelblue',
    'red',
    '#05b378',      // green
    'orange',
    '#4040e8',      // purple
    'yellow'
  ].map(function (v) {
    return d3.hsl(v);
  }),
  ITERATIONS_LIMIT: 1000,
  DEFAULT_WIDTH: 550,
  DEFAULT_HEIGHT: 350,
  TIP_X_EPS: 1
};
