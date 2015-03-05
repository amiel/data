var get = Ember.get;
var isArray = Ember.isArray;
var sanitize = encodeURIComponent;

/**

  WARNING: This interface is likely to change in order to accomodate https://github.com/emberjs/rfcs/pull/4

  ## Using BuildURLMixin

  To use url building, include the mixin when extending an adapter, and call `buildURL` where needed.
  The default behaviour is designed for RESTAdapter.

  ### Example

  ```javascript
  export default DS.Adapter.extend(BuildURLMixin, {
    find: function(store, type, id, record) {
      var url = this.buildURL(type.typeKey, id, record);
      return this.ajax(url, 'GET');
    }
  });
  ```

  ### Attributes

  The `host` and `namespace` attributes will be used if defined, and are optional.

  @class BuildURLMixin
  @namespace DS
*/
export default Ember.Mixin.create({
  // Default template should mimick original behaviour
  urlTemplate: '{host}{/namespace}/{pathForType}{/id}',
  mergedProperties: ['urlSegments'],

  /**
    Builds a URL for a given type and optional ID.

    By default, it pluralizes the type's name (for example, 'post'
    becomes 'posts' and 'person' becomes 'people'). To override the
    pluralization see [pathForType](#method_pathForType).

    If an ID is specified, it adds the ID to the path generated
    for the type, separated by a `/`.

    @method buildURL
    @param {String} type
    @param {String} id
    @param {DS.Model} record
    @return {String} url
  */
  buildURL: function(type, id, record, requestType) {
    var template = this.compileTemplate(this.get('urlTemplate'));
    var templateResolver = this.templateResolverFor(type);
    var adapter = this;

    return template.fill(function(name) {
      var result = templateResolver.get(name);

      if (Ember.typeOf(result) === 'function') {
        return result.call(adapter, type, id, record, requestType);
      } else {
        return result;
      }
    });
  },

  // TODO: Use fully compliant rfc6570 library
  compileTemplate: function(template) {
    return Ember.Object.create({
      template: template,
      fill: function(fn) {
        return this.get('template').replace(/\{([\/?]?)(\w+)\}/g, function(_, prefix, name) {
          var result = fn(name);

          if (prefix === '?') { prefix = '?' + name + '='; }

          if (result) {
            return prefix + result;
          } else {
            return '';
          }
        });
      }
    });
  },

  // TODO: Add ability to customize templateResolver
  templateResolverFor: function(type) {
    return Ember.Object.create(get(this, 'urlSegments'));
  },

  urlSegments: {
    host: function () { return this.get('host'); },
    namespace: function() { return this.get('namespace'); },
    pathForType: function(type) { return this.pathForType(type); },

    id: function(type, id, record) {
      if (id && !isArray(id)) { return sanitize(id); }
    },

    unknownProperty: function(key) {
      return function(type, id, record, requestType) {
        return get(record, key);
      };
    }
  },

 /**
    @method urlPrefix
    @private
    @param {String} path
    @param {String} parentUrl
    @return {String} urlPrefix
  */
  urlPrefix: function(path, parentURL) {
    var host = get(this, 'host');
    var namespace = get(this, 'namespace');
    var url = [];

    if (path) {
      // Protocol relative url
      //jscs:disable disallowEmptyBlocks
      if (/^\/\//.test(path)) {
        // Do nothing, the full host is already included. This branch
        // avoids the absolute path logic and the relative path logic.

      // Absolute path
      } else if (path.charAt(0) === '/') {
        //jscs:enable disallowEmptyBlocks
        if (host) {
          path = path.slice(1);
          url.push(host);
        }
      // Relative path
      } else if (!/^http(s)?:\/\//.test(path)) {
        url.push(parentURL);
      }
    } else {
      if (host) { url.push(host); }
      if (namespace) { url.push(namespace); }
    }

    if (path) {
      url.push(path);
    }

    return url.join('/');
  },

  /**
    Determines the pathname for a given type.

    By default, it pluralizes the type's name (for example,
    'post' becomes 'posts' and 'person' becomes 'people').

    ### Pathname customization

    For example if you have an object LineItem with an
    endpoint of "/line_items/".

    ```js
    App.ApplicationAdapter = DS.RESTAdapter.extend({
      pathForType: function(type) {
        var decamelized = Ember.String.decamelize(type);
        return Ember.String.pluralize(decamelized);
      }
    });
    ```

    @method pathForType
    @param {String} type
    @return {String} path
  **/
  pathForType: function(type) {
    var camelized = Ember.String.camelize(type);
    return Ember.String.pluralize(camelized);
  }
});
