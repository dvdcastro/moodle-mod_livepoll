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
 * Live poll main module.
 *
 * @package mod_livepoll
 * @copyright Copyright (c) 2018 Blackboard Inc.
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(['jquery', 'core/log', 'core/chartjs-lazy'],
    function($, Log, Chart) {

        var self = this;

        var init = function(apiKey, projectID, pollKey, userKey, options, correctOption) {
            self.apiKey = apiKey;
            self.projectID = projectID;
            self.options = options;
            self.correctOption = correctOption;
            self.pollKey = pollKey;
            self.userKey = userKey;

            resetVotes();

            $(document).ready(function() {
                /* global firebase */
                if (undefined === firebase) {
                    Log.error('Firebase not found. Live poll will not work.');
                    return;
                }
                self.firebase = firebase;
                initFirebase();
            });
        };

        var resetVotes = function() {
            self.votes = [];
            $.each(self.options, function(optionid) {
                self.votes[optionid] = 0;
            });
        };

        var initFirebase = function() {
            // Set the configuration for your app.
            var config = {
                apiKey: self.apiKey,
                authDomain: self.projectID + ".firebaseapp.com",
                databaseURL: "https://" + self.projectID + ".firebaseio.com",
                storageBucket: self.projectID + ".appspot.com"
            };

            self.firebase.initializeApp(config);

            // Get a reference to the database service.
            self.database = self.firebase.database();
            self.auth = self.firebase.auth();
            self.auth.onAuthStateChanged(function(user) {
                if (user) {
                    self.fbuser = user;
                } else {
                    // Sign the user in anonymously since accessing Storage requires the user to be authorized.
                    self.auth.signInAnonymously();
                }
                initChart();
                addDBListeners();
                addClickListeners();
            });
        };

        var addDBListeners = function() {
            var pollRef = self.database.ref('polls/' + self.pollKey);
            pollRef.on('child_added', updateVoteCount);
            pollRef.on('child_changed', updateVoteCount);
            pollRef.on('child_removed', updateVoteCount);

            updateVoteUI();
        };

        var addClickListeners = function() {
            $('.livepoll-votebtn').on('click', function(){
                var option = $(this).data('option');
                var vote = {
                    option: option
                };
                var voteRef = self.database.ref('polls/' + self.pollKey + '/votes/' + self.userKey);
                voteRef.set(vote);
            }).removeClass('disabled');
        };

        var updateVoteCount = function(snapshot) {
            var votes = snapshot.val();
            resetVotes();
            $.each(votes, function( userKey, vote ) {
                self.votes[vote.option]++;
                if (userKey === self.userKey) {
                    $('.livepoll-votebtn').addClass('btn-primary').removeClass('btn-success');
                    $('.livepoll-votebtn[data-option="' + vote.option + '"]').addClass('btn-success').removeClass('btn-primary');
                }
            });
            updateVoteUI();
        };

        var updateVoteUI = function() {
            self.chart.data.datasets[0].data = [];
            $.each(self.options, function(optionid) {
                var voteCount = self.votes[optionid];
                $('#vote-count-' + optionid).text(voteCount);
                self.chart.data.datasets[0].data.push(voteCount);
            });
            self.chart.update();
        };

        var initChart = function() {
            var ctx = document.getElementById("livepoll-chart").getContext("2d");

            var labels = [], votes = [];
            $.each(self.options, function(optionid, label) {
                labels.push(label);
                votes.push(0);
            });

            self.chart = new Chart(ctx, {
                type: 'bar',
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
        };

        return {
            'init': init
        };
    });
