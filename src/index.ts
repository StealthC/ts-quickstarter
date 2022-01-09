import axios, { AxiosRequestHeaders } from 'axios'
import { Cdm, DeviceConfig, LoadDevice } from 'widevine-ts-cdm'
import * as device from '../device/device.json'
//import { HttpsProxyAgent } from 'https-proxy-agent'

const headers = JSON.parse(process.env.HEADERS ?? "{}");
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

const device_config = LoadDevice(device, 'device/')

const lic_server = process.env.LIC_SERVER ?? "";
const initial_data = process.env.INITIAL_DATA ?? "";

delete axios.defaults.headers.post['Content-Type']
//const agent = new HttpsProxyAgent('http://:@127.0.0.1:8080')
const WV_SYSTEM_ID = [
  237, 239, 139, 169, 121, 214, 74, 206, 163, 200, 39, 220, 213, 29, 33, 237,
]

async function getKeys(
  pssh_b64: string,
  device: DeviceConfig,
  license_server: string,
  headers: AxiosRequestHeaders
) {
  pssh_b64 = check_pssh(pssh_b64)
  const cdm = new Cdm()
  const session = cdm.open_session(pssh_b64, device)
  const raw_data = cdm.get_license_request(session)
  const response = await axios.post(
    license_server,
    Buffer.from(raw_data),
    {
      headers,
      //httpsAgent: agent,
      responseType: 'arraybuffer'
    }
  )
  const response_b64 = Buffer.from(response.data).toString("base64");
  cdm.provide_license(session, response_b64);
}

function check_pssh(pssh_b64: string) {
  const pssh = Buffer.from(pssh_b64, 'base64')
  if (!pssh.subarray(12, 28).equals(Buffer.from(WV_SYSTEM_ID))) {
    throw new Error('Eita')
  } else {
    return pssh_b64
  }
}

getKeys(initial_data, device_config, lic_server, headers)
