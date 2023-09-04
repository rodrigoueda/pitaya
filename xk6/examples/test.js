import pitaya from 'k6/x/pitaya';
import { check } from 'k6';

export const options = {
  vus: 100,
  duration: '10s',
}

const opts = {
  handshakeData: {
    sys: {
      clientVersion: "1.0.1",
      clientBuildNumber: "1",
      platform: "android"
    },
    user: {
      fiu: "c0a78b27-dd34-4e0d-bff7-36168fce0df5",
      bundleId: "com.game.test",
      deviceType: "ios",
      language: "en",
      osVersion: "12.0",
      region: "US",
      stack: "green-stack"
    }
  },
  requestTimeoutMs: 1000,
  logLevel: "info",
  serializer: "json",
}

const pitayaClient = new pitaya.Client(opts)

export default async () => {
  if (!pitayaClient.isConnected()) {
    pitayaClient.connect("localhost:3250")
  }

  check(pitayaClient.isConnected(), { 'pitaya client is connected': (r) => r === true })

  var res = await pitayaClient.request("room.room.entry")
  check(res.result, { 'contains an result field': (r) => r !== undefined })
  check(res.result, { 'result is ok': (r) => r === "ok" })

  var res = await pitayaClient.request("room.room.setsessiondata", { data: {"testKey": "testVal"} })
  check(res, { 'res is success': (r) => String.fromCharCode.apply(null,r) === "success"} )
  var res = await pitayaClient.request("room.room.getsessiondata")
  check(res.Data, { 'res contains set data': (r) => r.testKey === "testVal"} )
  res = await pitayaClient.request("room.room.join")
  check(res.result, { 'result from join is successful': (r) => r === "success"} )
  res = await pitayaClient.consumePush("onMembers", 500)
  check(res.Members, { 'res contains a member group': (m) => m !== undefined } )
  res = await pitayaClient.request("room.room.leave")
  check(res, { 'result from leave is successful': (r) => String.fromCharCode.apply(null,r) === "success"})

 pitayaClient.disconnect()
}

export function teardown() {
}