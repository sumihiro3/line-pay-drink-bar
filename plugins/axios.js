export default function({ $axios, redirect }) {
  $axios.onRequest((config) => {
    config.headers.common['Access-Control-Allow-Origin'] = '*'
  })
  $axios.onError((error) => {
    if (error.response.status === 500) {
      redirect('/sorry')
    }
  })
}
