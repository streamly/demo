declare module '@newrelic/video-videojs' {
  interface NewRelicOptions {
    info: {
      beacon: string
      licenseKey: string
      applicationID: string
    }
    customData?: {
      [key: string]: any
    }
  }

  class VideojsTracker {
    constructor(player: any, options: NewRelicOptions)
    dispose(): void
  }

  export default VideojsTracker
}
