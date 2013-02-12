Backlash
========

A simple library that attempts to bring Knockout style model-view bindings to Backbone

Requirements
------------
Designed to work with Backbone 0.9.9 or newer.  An AMD module loader (like Require.js) is also required to use the code as-is. A non-AMD version might be provided at some point in the future.

Overview
--------
The library works by assigning events to all DOM elements with "data-bind" attributes in a given Backbone view. As the model is updated, any bound DOM elements are automatically updated to reflect the changes made to the model. Bound **form** elements recieve additional event bindings to update their backing model fields whenever changes are made.
