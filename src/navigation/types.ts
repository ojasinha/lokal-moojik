export type RootStackParamList = {
  MainTabs: undefined;
  Player: undefined;
  Queue: undefined;
  Search: undefined;
  ArtistDetail: { artistId: string; artistName: string };
  AlbumDetail: { albumId: string; albumName: string };
  PlaylistDetail: { playlistId: string; playlistName: string };
};

export type TabParamList = {
  Home: undefined;
  Favourites: undefined;
  Playlists: undefined;
  Settings: undefined;
};

// Type augmentation so useNavigation() is typed app-wide
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
