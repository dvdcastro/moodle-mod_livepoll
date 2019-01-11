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
define(['jquery', 'core/log'],
    function($, Log) {

        var self = this;

        /**
         * Module initialization function.
         *
         * @param apiKey
         * @param projectID
         * @param pollKey
         * @param userKey
         * @param options
         * @param correctOption
         */
        var init = function(apiKey, projectID, pollKey, userKey, options, correctOption, resultsToRender) {
            self.apiKey = apiKey;
            self.projectID = projectID;
            self.options = options;
            self.correctOption = correctOption;
            self.pollKey = pollKey;
            self.userKey = userKey;
            self.resultsToRender = resultsToRender;

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

        /**
         * Resets the vote count for each option to 0.
         */
        var resetVotes = function() {
            self.votes = [];
            $.each(self.options, function(optionid) {
                self.votes[optionid] = 0;
            });
        };

        /**
         * Initializes firebase library.
         */
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
                initVoteUI().done(function() {
                    addDBListeners();
                    addClickListeners();
                });
            });
        };

        /**
         * Adds listeners for state changes in the poll.
         */
        var addDBListeners = function() {
            var pollRef = self.database.ref('polls/' + self.pollKey);
            pollRef.on('child_added', updateVoteCount);
            pollRef.on('child_changed', updateVoteCount);
            pollRef.on('child_removed', updateVoteCount);

            updateVoteUI();
        };

        /**
         * Adds the click listener to each vote btn so the vote firebase db is updated.
         */
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

        /**
         * Updates the voute count and vote UI for a poll snapshot.
         * @param snapshot
         */
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

        /**
         *
         * @returns {*|jQuery}
         */
        var initVoteUI = function() {
            var dfd = $.Deferred(), subPromises = [];
            self.resultHandlers = [];
            var textDecorators = ['green', 'bold', 'shadowy'];
            $.each(self.resultsToRender, function(i, rType) {
                var reqDfd = $.Deferred();
                require(
                    [
                        'mod_livepoll/' + rType + '-result-lazy'
                    ], function(Handler) {
                        if (rType === 'text') {
                            var currentTxtResult = new Handler(), txtPromises = [];

                            $.each(textDecorators, function(i, decoratorId) {
                                var txtDfd = $.Deferred();
                                txtPromises.push(txtDfd.promise());
                                require(
                                    [
                                        'mod_livepoll/' + decoratorId + '-text-result-lazy'
                                    ], function(TextDecorator) {
                                        currentTxtResult = new TextDecorator(currentTxtResult);
                                        txtDfd.resolve();
                                    }
                                );
                            });

                            $.when.apply($, txtPromises).done(function() {
                                self.resultHandlers.push(currentTxtResult);
                                reqDfd.resolve();
                            });
                        } else {
                            self.resultHandlers.push(new Handler());
                            reqDfd.resolve();
                        }
                    }
                );
                subPromises.push(reqDfd.promise());
            });

            $.when.apply($, subPromises).done(function() {
                dfd.resolve();
            });

            return dfd.promise();
        };

        /**
         * Updates the vote UI.
         * Chart and text vote count.
         */
        var updateVoteUI = function() {
            var promises = [];
            $.each(self.resultHandlers, function(i, handler) {
                var promise = handler.update(self.options, self.votes);
                promises.push(promise);
            });
            $.when.apply($, promises).done(function() {
                Log.debug('livepoll UI has been updated.');
            });
        };

        return {
            'init': init
        };
    });
