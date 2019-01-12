
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
define(['jquery', 'mod_livepoll/util', 'mod_livepoll/decorated-text-result'],
    function($, util, DecoratedTextResult) {
        /**
         * Text result constructor.
         * @returns {CloserTextResult}
         * @constructor
         */
        function CloserTextResult(decoratedResult) {
            DecoratedTextResult.call(this, decoratedResult);
            return (this);
        }

        // Prototype extension.
        CloserTextResult.prototype = Object.create(DecoratedTextResult.prototype);

        /**
         * @inheritDoc
         */
        CloserTextResult.prototype.renderResult = function(options, votes) {
            var highest = util.getHighestVotedOptions(options, votes);
            $.each(options, function(optionid) {
                $('#vote-count-' + optionid)
                    .parent()
                    .removeClass('mod-livepoll-3d-spinner')
                    .parent()
                    .removeClass('mod-livepoll-3d-stage');
            });
            if (highest.length > 0) {
                $.each(highest, function(i, optionid) {
                    $('#vote-count-' + optionid)
                        .parent()
                        .addClass('mod-livepoll-3d-spinner')
                        .parent()
                        .addClass('mod-livepoll-3d-stage');
                });
            }
            Object.getPrototypeOf(CloserTextResult.prototype).renderResult.call(this, options, votes);
        };

        return (CloserTextResult);
    }
);