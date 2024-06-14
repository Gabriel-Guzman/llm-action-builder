import axios from 'axios';

export async function search(query: string) {
    const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.SEARCH_API_KEY}&cx=${process.env.SEARCH_API_CX}&q=${query}`;

    const response = await axios.get(url);
    console.log(response);
    return response.data;
}
