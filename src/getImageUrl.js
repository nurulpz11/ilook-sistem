

const getImageUrl = (filename) => {
    if (!filename) return ''; // Jika tidak ada nama file, kembalikan string kosong
  
    // Ambil base URL dari .env dan ubah '/api' jadi '/storage'
    const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '/storage');
  
    return `${baseUrl}/${filename}`;
  };
  
  export default getImageUrl;