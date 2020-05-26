import * as functions from 'firebase-functions';
import { FluxFmCrawler, FluxFmSong } from "./fluxfmcrawler";

const admin = require('firebase-admin');
admin.initializeApp();

export const fluxfmcrawler = functions.https.onRequest(async (request, response) => {
  const db = admin.firestore();
  const crawler: FluxFmCrawler = new FluxFmCrawler();
  const songs: FluxFmSong[] = await crawler.crawl();
  let counter = 0;
  songs.forEach((song) => {
    const docId = `${song.date}_${song.time}`;
    db.collection('playlist').doc(docId).get()
      .then((doc: any) => {
        if (doc.exists) {
          console.log(`already exists: ${docId} - ${song.artist} - ${song.title}`)
        }
        else {
          counter++;
          console.log(`add new document: ${docId} - ${song.artist} - ${song.title}`);
          db.collection('playlist').doc(docId).set(song).then(() => {
            // do nothing
          });
        }
      }).catch(console.error);

  });
  response.send(`Hello from Firebase!\n added ${counter} new tracks`);
});
