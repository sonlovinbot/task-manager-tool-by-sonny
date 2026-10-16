// Pin the timezone so local-date logic is tested where UTC and local dates differ (Vietnam, UTC+7).
export default function setup() {
  process.env.TZ = 'Asia/Ho_Chi_Minh'
}
