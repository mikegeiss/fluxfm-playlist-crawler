import moment from 'moment';
import axios from 'axios';
import { loadStorage, updateStorage } from 'webtask-storage-async';

moment.locale('de');

const FLUXFM_URL = "https://www.fluxfm.de/fluxfm-playlist/api.php?loc=berlin&act=list&limit=100&cuttime=1";
const TIME_FORMAT = 'DD.MM.YYYY HH:mm';
const SONGS_STORAGE_KEY = "songs";
module.exports = (context, callback) => {

  console.log('start');

  let logs = [];

  run().then(
    numberOfNewSongs => {
      callback(null, { success: `${numberOfNewSongs} neue Songs gefunden`, logs });
    },
    error => {
      callback(null, { error, logs });
    }
  );
  async function run() {
    const storage = await loadStorageNullSafe();
    const response = await axios.get(FLUXFM_URL, { headers: { "Accept-Charset": "utf-8" } });
    const fluxfm: FluxFmResult = response.data;
    let numberOfNewSongs = 0;

    try {
      fluxfm.tracks.forEach((song) => {
        const timestamp = moment(`${song.date} - ${song.time}`, "YYYY-MM-DD - HH:mm")

        if (!storage[timestamp.format(TIME_FORMAT)]) {
          const entry = `${song.artist} - ${song.title}`;
          storage[timestamp.format(TIME_FORMAT)] = entry;
          logs.push(`added: ${entry} (${timestamp.format(TIME_FORMAT)})`);
          numberOfNewSongs++;
        }
      })
      const storageSorted = {};
      Object.keys(storage).sort().reverse().forEach(function (key) {
        storageSorted[key] = storage[key];
      });
      await updateStorage(context.storage, SONGS_STORAGE_KEY, storageSorted);
      return numberOfNewSongs
    } catch (error) {
      console.error(error);
    }
  }

  function log(message: any) {
    logs.push(message);
  }

  async function loadStorageNullSafe() {
    const result = await loadStorage(context.storage, SONGS_STORAGE_KEY);
    return result ? result : {};
  }
}

interface FluxFmResult {
  status: string;
  tracks: Song[];
}
interface Song {
  id: string;
  // date: '2020-04-06'
  date: string;
  // time: '05:37'
  time: string;
  artist: string;
  title: string;
  album: string;
  coverurl: any;
}