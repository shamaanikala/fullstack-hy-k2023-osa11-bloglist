import axios from 'axios'
const baseUrl = '/api/login'

const login = async credentials => {
  const response = await axios.post(baseUrl, credentials)
  return response.data
}

const verify = async (userWithToken,config) => {
  // console.log(userWithToken)
  // console.log(`Lähetetään verify-token ${userWithToken}`)
  // console.log(userWithToken)
  const response = await axios.post(`${baseUrl}/verify-token`, userWithToken,config)
  return response.data
}

//// eslint-disable-next-line import/no-anonymous-default-export
export default { login, verify }