/**
 * DropZone.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new dropzone.
 *
 * @-x-less DropZone.less
 * @class tinymce.ui.DropZone
 * @extends tinymce.ui.Widget
 */
define(
  'tinymce.core.ui.DropZone',
  [
    'tinymce.core.ui.Widget',
    'tinymce.core.util.Tools',
    'tinymce.core.ui.DomUtils',
    'global!RegExp'
  ],
  function (Widget, Tools, DomUtils, RegExp) {
    return Widget.extend({
      /**
       * Constructs a instance with the specified settings.
       *
       * @constructor
       * @param {Object} settings Name/value object with settings.
       * @setting {Boolean} multiple True if the dropzone is a multiple control.
       * @setting {Number} maxLength Max length for the dropzone.
       * @setting {Number} size Size of the dropzone in characters.
       */
      init: function (settings) {
        var self = this;

        settings = Tools.extend({
          height: 100,
          text: "Drop an image here",
          multiple: false,
          accept: null // by default accept any files
        }, settings);

        self._super(settings);

        self.classes.add('dropzone');

        if (settings.multiple) {
          self.classes.add('multiple');
        }
      },

      /**
       * Filters files array according to the accept setting
       *
       * @method filter
       * @param {Array} files
       * @return {Array} Filtered files array
       */
      filter: function (files) {
        var accept = this.settings.accept;
        if (typeof accept !== 'string') {
          return files;
        }

        var re = new RegExp('(' + accept.split(/\s*,\s*/).join('|') + ')$', 'i');
        return Tools.grep(files, function (file) {
          return re.test(file.name);
        });
      },

      /**
       * Renders the control as a HTML string.
       *
       * @method renderHtml
       * @return {String} HTML representing the control.
       */
      renderHtml: function () {
        var self = this, attrs, elm;
        var cfg = self.settings;

        var isDecimal = function (str) {
          var type = typeof str;
          if (type == 'number') {
            return true;
          } else if (type === 'string') {
            return /^\d+$/.test(str);
          } else {
            return false;
          }
        };

        attrs = {
          id: self._id,
          hidefocus: '1'
        };

        elm = DomUtils.create('div', attrs, '<span>' + cfg.text + '</span>'); // TODO: better encode this

        DomUtils.css(elm, {
          width: isDecimal(cfg.width) ? cfg.width + 'px' : cfg.width,
          height: isDecimal(cfg.height) ? cfg.height + 'px' : cfg.height
        });

        elm.className = self.classes;

        return elm.outerHTML;
      },


        /**
       * Called after the control has been rendered.
       *
       * @method postRender
       */
      postRender: function () {
        var self = this;

        var toggleDragClass = function (e) {
          e.preventDefault();
          self.classes.toggle('dragenter');
          self.getEl().className = self.classes;
        };

        self._super();

        self.$el.on('dragover', function (e) {
          e.preventDefault();
        });

        self.$el.on('dragenter', toggleDragClass);
        self.$el.on('dragleave', toggleDragClass);

        self.$el.on('drop', function (e) {
          e.preventDefault();

          if (self.state.get('disabled')) {
            return;
          }

          var files = self.filter(e.dataTransfer.files);

          self.value = function () {
            if (!files.length) {
              return null;
            } else if (self.settings.multiple) {
              return files;
            } else {
              return files[0];
            }
          };

          if (files.length) {
            self.fire('change', e); // should we fire a drop event here for consistency (as well) maybe?
          }
        });
      },

      remove: function () {
        this.$el.off();
        this._super();
      }
    });
  }
);
