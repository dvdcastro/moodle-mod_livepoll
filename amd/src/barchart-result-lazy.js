// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Live poll barchart result for poll rendering.
 *
 * @package mod_livepoll
 * @copyright Copyright (c) 2018 Blackboard Inc.
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(['jquery', 'core/log', 'mod_livepoll/result', 'core/chartjs-lazy'],
    function($, Log, Result, Chart) {

        /**
         * Text result constructor.
         * @returns {BarChartResult}
         * @constructor
         */
        function BarChartResult() {
            Result.call(this);
            this._initialized = false;
            this._chartType = 'bar';
            return (this);
        }

        // Prototype extension.
        BarChartResult.prototype = Object.create(Result.prototype);

        /**
         * Initializes the Char.JS element.
         * @param options
         */
        BarChartResult.prototype.initChart = function(options) {
            var ctx = document.getElementById("livepoll-chart").getContext("2d");

            var labels = [], votes = [];
            $.each(options, function(optionid, label) {
                labels.push(label);
                votes.push(0);
            });

            this._chart = new Chart(ctx, {
                type: this._chartType,
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Votes",
                        data: votes,
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });

            Log.debug('Bar chart initialized!');
        };

        /**
         * {@inheritdoc}
         */
        BarChartResult.prototype.performUpdate = function(options, votes, callback) {
            var self = this;
            if (!self._initialized) {
                self.initChart(options);
                self._initialized = true;
            }

            self._chart.data.datasets[0].data = [];
            $.each(options, function(optionid) {
                self._chart.data.datasets[0].data.push(votes[optionid]);
            });
            self._chart.update();
            callback();
        };

        return (BarChartResult);
    }
);