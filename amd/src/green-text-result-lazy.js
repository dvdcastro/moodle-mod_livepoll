
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
 * Live poll shiny decorated text result for poll rendering.
 *
 * @package mod_livepoll
 * @copyright Copyright (c) 2018 Blackboard Inc.
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(['jquery', 'mod_livepoll/decorated-text-result'],
    function($, DecoratedTextResult) {
        /**
         * Text result constructor.
         * @returns {TextResult}
         * @constructor
         */
        function GreenTextResult(decoratedResult) {
            DecoratedTextResult.call(this, decoratedResult);
            return (this);
        }

        // Prototype extension.
        GreenTextResult.prototype = Object.create(DecoratedTextResult.prototype);

        /**
         * @inheritDoc
         */
        GreenTextResult.prototype.renderResult = function(options, votes) {
            var highest = '', highValue = 0;
            $.each(options, function(optionid) {
                if (votes[optionid] > highValue) {
                    highest = optionid;
                    highValue = votes[optionid];
                }
                $('#vote-count-' + optionid).parent()
                    .addClass('alert-info')
                    .removeClass('alert-success');
            });
            if (highest !== '') {
                $('#vote-count-' + highest).parent()
                    .removeClass('alert-info')
                    .addClass('alert-success');
            }
            Object.getPrototypeOf(GreenTextResult.prototype).renderResult.call(this, options, votes);
        };

        return (GreenTextResult);
    }
);