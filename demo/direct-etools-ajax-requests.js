import '@polymer/polymer/polymer-legacy.js';
import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import Dexie from 'dexie';
import EtoolsAjaxRequestMixin from '../etools-ajax-request-mixin.js';
// set logging level
window.EtoolsLogsLevel = window.EtoolsLogsLevel || 'INFO';
// custom dexie db that will be used by etoolsAjax
var etoolsCustomDexieDb = new Dexie('etoolsAjax2DexieDb');
etoolsCustomDexieDb.version(1).stores({
  listsExpireMapTable: "&name, expire",
  ajaxDefaultDataTable: "&cacheKey, data, expire",
  countries: "&id, name"
});

// configure app dexie db to be used for caching
window.EtoolsRequestCacheDb = etoolsCustomDexieDb;

class DirectAjaxCalls extends EtoolsAjaxRequestMixin(PolymerElement) {
  static get is() {
    return 'direct-ajax-calls';
  }

  ready() {
    super.ready();
    // console.log(this.etoolsAjaxCacheDb);

    this._setCookie();

    this.get_WithNoCache();
    // this.get_WithCacheToDefaultTable();
    // this.get_WithCacheToSpecifiedTable();

    this.post_Json();
    this.patch_WithJsonContent();
    this.patch_WithCsrfCheck();
    this.patch_WithAdditionalHeaders();
    //  this.post_WithMultipartData();

  }

  post_Json() {
    this.sendRequest({
      method: 'DELETE',
      endpoint: {
        url: 'http://httpbin.org/delete',
      },
      body: {
        id: "14",
        firstName: "JaneTEST",
        lastName: "DoeTest"
      }
    }).then(function (resp) {
      console.log(resp);
    }).catch(function (error) {
      console.log(error);
    });
  }

  patch_WithJsonContent() {
    this.sendRequest({
      method: 'PATCH',
      endpoint: {
        url: 'http://httpbin.org/patch',
      },
      body: {
        id: "14",
        firstName: "JaneTEST2"
      }
    }).then(function (resp) {
      console.log(resp);
    }).catch(function (error) {
      console.log(error);
    });
  }

  get_WithNoCache() {
    this.sendRequest({
      endpoint: {
        url: 'http://httpbin.org/get',
      },
      params: {
        id: 10,
        name: 'Georgia'
      }
    }).then(function (resp) {
      console.log(resp);
    }).catch(function (error) {
      console.log(error);
    });

    this.sendRequest({
      endpoint: {
        url: 'http://httpbin.org/status/403',
      }
    }).then(function (resp) {
      console.log(resp);
    }).catch(function (error) {
      console.log(error);
    });
  }

  get_WithCacheToDefaultTable() {
    this.sendRequest({
      endpoint: {
        url: 'http://192.168.1.184/silex-test-app/web/index.php/countries-data',
        exp: 5 * 60 * 1000, // cache set for 5m
        cachingKey: 'countries',
      }
    }).then(function (resp) {
      console.log(resp);
    }).catch(function (error) {
      console.log(error);
    });
  }

  get_WithCacheToSpecifiedTable() {
    this.sendRequest({
      endpoint: {
        url: 'http://192.168.1.184/silex-test-app/web/index.php/countries-data',
        exp: 5 * 60 * 1000, // cache set for 5m
        cacheTableName: 'countries'
      }
    }).then(function (resp) {
      console.log(resp);
    }).catch(function (error) {
      console.log(error);
    });
  }

  patch_WithCsrfCheck() {
    this.sendRequest({
      method: 'PATCH',
      endpoint: {
        url: 'http://httpbin.org/patch',
      },
      body: {
        id: "14",
        firstName: "JaneTEST2"
      },
      csrfCheck: true
    }).then(function (resp) {
      console.log(resp);
    }).catch(function (error) {
      console.log(error);
    });
  }

  patch_WithAdditionalHeaders() {
    this.sendRequest({
      method: 'PATCH',
      endpoint: {
        url: 'http://httpbin.org/patch',
      },
      body: {
        id: "14",
        firstName: "JaneTEST2"
      },
      headers: {
        'Authorization': 'Bearer lt8fnG9CNmLmsmRX8LTp0pVeJqkccEceXfNM8s_f624'
      }
    }).then(function (resp) {
      console.log(resp);
    }).catch(function (error) {
      console.log(error);
    });
  }

  post_WithMultipartData() {
    this.sendRequest({
      method: 'POST',
      endpoint: {
        url: 'http://192.168.1.184/silex-test-app/web/index.php/handle-post-put-delete-data',
      },
      body: this._getBodyWithBlobsOrFilesData(),
      multiPart: true,
      prepareMultipartData: true
    }).then(function (resp) {
      console.log(resp);
    }).catch(function (error) {
      console.log(error);
    });
  }

  _setCookie() {
    // set cookie
    var cookieVal = 'someCookieValue123';
    var d = new Date();
    d.setTime(d.getTime() + (1 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString(); // cookie will expire in 1 hour
    document.cookie = "csrftoken=" + cookieVal + "; " + expires + "; path=/";
  }

  // just a body object that will be used by EtoolsAjaxRequestMixin to prepare multipart body data of request
  // to fit etools app needs, on backend there must be a custom parser for this data
  _getBodyWithBlobsOrFilesData() {
    return {
      id: "13",
      firstName: "John",
      lastName: "Doe",
      testObj: {
        id: 1,
        name: 'testing'
      },
      testArr: [
        {
          id: 2,
          name: 'testing 2',
          someArray: [1, 3],
          dummyData: {
            test: [1, 2, 3, function () {
              var content = '<a id="id1"><b id="b">hey you 1!</b></a>';
              return new Blob([content], {type: "text/xml"});
            }()],
            dummyDataChild: {
              id: 1,
              id_2: [
                {
                  file: function () {
                    var content = '<a id="id2"><b id="b">hey you 2!</b></a>';
                    return new Blob([content], {type: "text/xml"});
                  }()
                }
              ],
              randomObject: {
                partner: 1,
                agreement: 2,
                assessment: function () {
                  var content = '<a id="id3"><b id="b">hey you 3!</b></a>';
                  return new Blob([content], {type: "text/xml"});
                }()
              }
            }
          }
        },
        1, 2, 3, 4, 5,
        function () {
          var content = '<a id="someId"><b id="b">hey you!</b></a>';
          return new Blob([content], {type: "text/xml"});
        }(),
      ],
      testArr2: [],
      someFile: function () {
        var content = '<a id="a"><b id="b">hey!</b></a>';
        return new Blob([content], {type: "text/xml"});
      }()
    };
  }
}

customElements.define(DirectAjaxCalls.is, DirectAjaxCalls);
