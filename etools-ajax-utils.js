/* eslint-disable linebreak-style */
import './scripts/es6-obj-assign-polyfil.js';

export function getCsrfHeader(csrfCheck) {
  let csrfHeaders = {};
  if (csrfCheck !== 'disabled') {
    let csrfToken = _getCSRFCookie();

    if (csrfToken) {
      csrfHeaders['x-csrftoken'] = csrfToken;
    }
  }
  return csrfHeaders;
}

export function csrfSafeMethod(method) {
  // these HTTP methods do not require CSRF protection
  return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function _getCSRFCookie() {
  // check for a csrftoken cookie and return its value
  let csrfCookieName = 'csrftoken';
  let csrfToken = null;
  if (document.cookie && document.cookie !== '') {
    let cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, csrfCookieName.length + 1) === (csrfCookieName + '=')) {
        csrfToken = decodeURIComponent(cookie.substring(csrfCookieName.length + 1));
        break;
      }
    }
  }
  return csrfToken;
}

export function tryJsonParse(response) {
  try {
    return JSON.parse(response);
  } catch (e) {
    return response;
  }
}

export function getClientConfiguredHeaders(additionalHeaders) {
  let header;
  let clientHeaders = {};
  if (additionalHeaders && additionalHeaders instanceof Object) {
    /* eslint-disable guard-for-in */
    for (header in additionalHeaders) {
      clientHeaders[header] = additionalHeaders[header].toString();
    }
    /* eslint-enable guard-for-in */
  }
  return clientHeaders;
}


export function getRequestHeaders(reqConfig) {
  let headers = {};

  headers['content-type'] = determineContentType(reqConfig.body);

  let clientConfiguredHeaders = getClientConfiguredHeaders(reqConfig.headers);
  let csrfHeaders = {};

  if (!csrfSafeMethod(reqConfig.method)) {
    csrfHeaders = getCsrfHeader(reqConfig.csrfCheck);
  }

  headers = Object.assign({}, headers, clientConfiguredHeaders, csrfHeaders);

  return headers;
}

/**
* Content-Type set here can be overridden later
* by headers sent from the client
*/
export function determineContentType(body) {
  let contentType = 'application/json';

  if (typeof body === 'string') {
    contentType = 'application/x-www-form-urlencoded';
  }

  return contentType;
}
