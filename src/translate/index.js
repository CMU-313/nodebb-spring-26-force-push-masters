
/* eslint-disable strict */

const translatorApi = module.exports;

const TRANSLATOR_API = process.env.TRANSLATOR_API || 'http://localhost:5000';

translatorApi.translate = async function (postData) {
	try {
		const response = await fetch(`${TRANSLATOR_API}/?content=${encodeURIComponent(postData.content)}`);
		const data = await response.json();
		return [data.is_english ? 1 : 0, data.translated_content];
	} catch (err) {
		return [1, postData.content];
	}
};
