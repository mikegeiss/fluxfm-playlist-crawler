import axios from "axios";

export class FluxFmCrawler {

  private readonly FLUXFM_URL = "https://www.fluxfm.de/fluxfm-playlist/api.php?loc=berlin&act=list&limit=100&cuttime=1";

  public async crawl(): Promise<FluxFmSong[]> {
    const response = await axios.get(this.FLUXFM_URL, {headers: {"Accept-Charset": "utf-8"}});
    const tracks = (response.data as FluxFmResult).tracks;
    return tracks
      .map(track => (
        {
          ...track,
          _timestamp: `${track.date}_${track.time}`
        }
      ));
  }
}

export interface FluxFmResult {
  status: string;
  tracks: FluxFmSong[];
}

export interface FluxFmSong {
  _timestamp: string;
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
