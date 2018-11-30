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

        var init = function(apiKey, projectID, pollKey, userKey, options, correctOption) {
            self.apiKey = apiKey;
            self.projectID = projectID;
            self.options = options;
            self.correctOption = correctOption;
            self.pollKey = pollKey;
            self.userKey = userKey;

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
                addDBListeners();
                addClickListeners();
            });
        };

        var addDBListeners = function() {
            var pollRef = self.database.ref('polls/' + self.pollKey);
            pollRef.on('child_added', updateVoteCount);
            pollRef.on('child_changed', updateVoteCount);
            pollRef.on('child_removed', updateVoteCount);

            resetVotes();
            updateVoteUI();

            var voteRef = self.database.ref('polls/' + self.pollKey + '/votes/' + self.userKey);
            voteRef.once('value').then(function(snapshot) {
                if (snapshot.val()) {
                    var optionid = snapshot.val().option;
                    $('.livepoll-votebtn[data-option="' + optionid + '"]').addClass('btn-success').removeClass('btn-primary');
                }
            });
        };

        var addClickListeners = function() {
            $('.livepoll-votebtn').on('click', function(){
                var option = $(this).data('option');
                var vote = {
                    option: option
                };
                var voteRef = self.database.ref('polls/' + self.pollKey + '/votes/' + self.userKey);
                voteRef.set(vote);
                // Reset all other buttons.
                $('.livepoll-votebtn').addClass('btn-primary').removeClass('btn-success');
                // Set this button'' color.
                $(this).removeClass('btn-primary').addClass('btn-success');
            }).removeClass('disabled');
        };

        var updateVoteCount = function(snapshot) {
            var votes = snapshot.val();
            resetVotes();
            $.each(votes, function( userKey, vote ) {
                self.votes[vote.option]++;
            });
            updateVoteUI();
        };

        var updateVoteUI = function() {
            $.each(self.options, function(optionid) {
                $('#vote-count-' + optionid).text(self.votes[optionid]);
            });
        };

        return {
            'init': init
        };
    });
