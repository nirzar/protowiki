import lf from 'localforage'

const VERSION_KEY = 'version'
const VERSION = 2

const db = init()
export default db

// Init localforage. Clear DB if version number is old.
function init () {
  lf.config({
    name: 'Wikipedia',
    version: VERSION,
    driver: [lf.INDEXEDDB, lf.LOCALSTORAGE]
  })
  return lf.getItem(VERSION_KEY)
    .then((oldVersion) => {
      // If the DB version is old, clear it out.
      return (oldVersion < VERSION)
        ? lf.clear().then(setVersion)
        : setVersion()
    })
}

function setVersion () { return lf.setItem(VERSION_KEY, VERSION) }
