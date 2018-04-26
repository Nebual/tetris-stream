
const API_URL = process.env.REACT_APP_API_HOST;
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

export const API_HOST = (new URL(API_URL)).hostname
