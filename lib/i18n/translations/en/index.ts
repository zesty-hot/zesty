import vipMetadata from "./metadata/vip.json";
import siteConfig from './metadata/site-config.json'
import escortsMetadata from './metadata/escorts.json'
import datingMetadata from './metadata/dating.json'
import liveMetadata from './metadata/live.json'
import cookies from './footer/cookies.json'
import jobsMetadata from './metadata/jobs.json'
import eventsMetadata from './metadata/events.json'

export default {
  metadata: {
    site: siteConfig,
    vip: vipMetadata,
    events: eventsMetadata,
    escorts: escortsMetadata,
    dating: datingMetadata,
    live: liveMetadata,
    jobs: jobsMetadata,
    openGraph: {
      images: {
        alt: 'Adult Dating & Entertainment'
      }
    }
  },
  footer: {
    cookies: cookies
  }
};