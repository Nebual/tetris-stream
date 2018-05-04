
const API_URL = process.env.REACT_APP_API_HOST;
const apiUrl = new URL(API_URL)
export function fetchApi(endpoint, method, body, options) {
	options = options || {}
	options.method = method || 'GET'
	options.headers = options.headers || {}
	options.headers['Content-Type'] = 'application/json'
	if (body) {
		options.body = JSON.stringify(body)
	}
	return fetch(`${API_URL}/${endpoint}`, options)
}

export const WS_URL = `ws://${apiUrl.hostname}` + (process.env.NODE_ENV === 'production' ? '/ws/' : ':3012');
