import axios from 'axios';

// Fetches data from a given URL
const fetchData = async (url) => {
    try {
        console.log(`Fetching data from: ${url}`);
        const response = await axios.get(url);
        console.log(`Data fetched successfully from ${url}`);
        return response.data;
    } catch (error) {
        console.error('Request failed:', error.message);
        return null;
    }
};

// Fetches HMAC data from the given URL
const fetchHmacData = async () => {
    try {
        console.log('Fetching HMAC data...');
        const response = await fetchData('https://babel-in.xyz/babel-b2ef9ad8f0d432962d47009b24dee465/tata/hmac');
        console.log('HMAC data fetched successfully');
        return response?.hdntl || null;
    } catch (error) {
        console.error('Error fetching HMAC data:', error.message);
        return null;
    }
};

// Generates the M3U playlist string
const generateM3u = async () => {
    try {
        console.log('Generating M3U playlist...');
        const channelsData = await fetchData('https://babel-in.xyz/babel-b2ef9ad8f0d432962d47009b24dee465/tata/channels');
        const hmacValue = await fetchHmacData();

        if (!channelsData || !channelsData.channels) throw new Error('No channel data found');

        let m3uStr = '#EXTM3U x-tvg-url="https://example.com/epg.xml.gz"\n\n';
        
        channelsData.channels.forEach(channel => {
            m3uStr += `#EXTINF:-1 tvg-id="${channel.id}" `;
            m3uStr += `group-title="${channel.genre || ''}", ${channel.name}\n`;
            m3uStr += `#KODIPROP:inputstream.adaptive.license_key=${channel.license_key || ''}\n`;
            m3uStr += `#EXTVLCOPT:http-user-agent=Mozilla/5.0\n`;
            m3uStr += `#EXTHTTP:{"cookie":"${hmacValue || ''}"}\n`;
            m3uStr += `${channel.stream_url}|cookie:${hmacValue || ''}\n\n`;
        });

        console.log('M3U playlist generated successfully.');
        return m3uStr;
    } catch (error) {
        console.error('Error generating M3U:', error.message);
        return 'Error generating M3U playlist';
    }
};

// API handler for HTTP requests
export default async function handler(req, res) {
    try {
        console.log('Handling API request...');
        const m3uString = await generateM3u();
        res.status(200).send(m3uString);
        console.log('API request handled successfully.');
    } catch (error) {
        console.error('Error handling API request:', error.message);
        res.status(500).send('Internal Server Error');
    }
}
