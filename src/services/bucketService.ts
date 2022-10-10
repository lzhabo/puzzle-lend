import axios from "axios";

const bucketService = {
  upload: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", file.type);
    const url = `${process.env.REACT_APP_API_BASE}/api/v1/bucket/upload`;
    const headers = { "Content-Type": "multipart/form-data" };
    const { data } = await axios.post(url, formData, { headers });
    return data;
  },
};
export default bucketService;
